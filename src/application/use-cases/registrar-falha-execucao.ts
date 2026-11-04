import { Execucao } from '../../domain/entities/execucao';
import { IExecucaoRepository } from '../../domain/repositories/execucao-repository.interface';
import { IHistoricoIntervencaoRepository } from '../../domain/repositories/historico-intervencao-repository.interface';
import { SagaPublisher } from '../ports/saga-publisher';

/**
 * Falha tecnica durante o reparo (ex: peca incompativel, impossibilidade
 * tecnica) - cancela a execucao e aciona a compensacao do Saga, para que
 * o OS Service revertam o status da OS e o Billing Service estorne o
 * pagamento ja aprovado.
 */
export class RegistrarFalhaExecucao {
  constructor(
    private execucaoRepo: IExecucaoRepository,
    private historicoRepo: IHistoricoIntervencaoRepository,
    private sagaPublisher: SagaPublisher,
  ) {}

  async execute(id: string, motivo: string): Promise<Execucao> {
    const execucao = await this.execucaoRepo.getById(id);
    if (!execucao) throw new Error('Execução não encontrada');

    execucao.cancelar();
    await this.execucaoRepo.save(execucao);
    await this.historicoRepo.registrar(
      execucao.id,
      execucao.getStatus(),
      motivo,
    );

    await this.sagaPublisher.publicar(
      'CompensarOSEvent',
      {
        ordemServicoId: execucao.ordemServicoId,
        origemFalha: 'EXECUCAO',
        motivo,
        compensarEm: new Date().toISOString(),
      },
      execucao.ordemServicoId,
    );

    return execucao;
  }
}
