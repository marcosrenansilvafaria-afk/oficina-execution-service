import { Execucao } from '../../domain/entities/execucao';
import { IExecucaoRepository } from '../../domain/repositories/execucao-repository.interface';
import { IHistoricoIntervencaoRepository } from '../../domain/repositories/historico-intervencao-repository.interface';
import { SagaPublisher } from '../ports/saga-publisher';

export class FinalizarExecucao {
  constructor(
    private execucaoRepo: IExecucaoRepository,
    private historicoRepo: IHistoricoIntervencaoRepository,
    private sagaPublisher: SagaPublisher,
  ) {}

  async execute(id: string): Promise<Execucao> {
    const execucao = await this.execucaoRepo.getById(id);
    if (!execucao) throw new Error('Execução não encontrada');

    execucao.finalizar();
    await this.execucaoRepo.save(execucao);
    await this.historicoRepo.registrar(execucao.id, execucao.getStatus());

    await this.sagaPublisher.publicar(
      'ExecucaoConcluidaEvent',
      {
        ordemServicoId: execucao.ordemServicoId,
        execucaoId: execucao.id,
        concluidaEm: execucao.getConcluidaEm()!.toISOString(),
      },
      execucao.ordemServicoId,
    );

    return execucao;
  }
}
