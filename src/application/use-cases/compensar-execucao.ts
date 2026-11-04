import { IExecucaoRepository } from '../../domain/repositories/execucao-repository.interface';
import { IHistoricoIntervencaoRepository } from '../../domain/repositories/historico-intervencao-repository.interface';

/**
 * Reage ao CompensarOSEvent do Saga. Idempotente e nao ramifica por
 * origemFalha: se nao existir Execucao para a OS (origemFalha=PAGAMENTO,
 * o reparo nunca chegou a entrar na fila), e um no-op; se existir e nao
 * estiver CONCLUIDA/CANCELADA, cancela (origemFalha=EXECUCAO e o eco do
 * proprio evento que este servico publicou via RegistrarFalhaExecucao -
 * a execucao ja foi cancelada antes de publicar, entao tambem e um no-op
 * na pratica, mas a checagem cobre qualquer ordem de entrega).
 */
export class CompensarExecucao {
  constructor(
    private execucaoRepo: IExecucaoRepository,
    private historicoRepo: IHistoricoIntervencaoRepository,
  ) {}

  async execute(ordemServicoId: string): Promise<void> {
    const execucao =
      await this.execucaoRepo.getByOrdemServicoId(ordemServicoId);
    if (!execucao) return;

    const status = execucao.getStatus();
    if (status === 'CONCLUIDA' || status === 'CANCELADA') return;

    execucao.cancelar();
    await this.execucaoRepo.save(execucao);
    await this.historicoRepo.registrar(
      execucao.id,
      execucao.getStatus(),
      'Compensacao do Saga',
    );
  }
}
