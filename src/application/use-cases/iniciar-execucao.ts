import { Execucao } from '../../domain/entities/execucao';
import { IExecucaoRepository } from '../../domain/repositories/execucao-repository.interface';
import { IHistoricoIntervencaoRepository } from '../../domain/repositories/historico-intervencao-repository.interface';
import { SagaPublisher } from '../ports/saga-publisher';

export class IniciarExecucao {
  constructor(
    private execucaoRepo: IExecucaoRepository,
    private historicoRepo: IHistoricoIntervencaoRepository,
    private sagaPublisher: SagaPublisher,
  ) {}

  async execute(id: string, mecanicoId?: string): Promise<Execucao> {
    const execucao = await this.execucaoRepo.getById(id);
    if (!execucao) throw new Error('Execução não encontrada');

    execucao.iniciar(mecanicoId);
    await this.execucaoRepo.save(execucao);
    await this.historicoRepo.registrar(execucao.id, execucao.getStatus());

    await this.sagaPublisher.publicar(
      'ExecucaoIniciadaEvent',
      {
        ordemServicoId: execucao.ordemServicoId,
        execucaoId: execucao.id,
        iniciadaEm: execucao.getIniciadaEm()!.toISOString(),
      },
      execucao.ordemServicoId,
    );

    return execucao;
  }
}
