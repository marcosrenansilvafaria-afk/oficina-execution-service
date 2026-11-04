import { generateId } from '../../utils/id';
import { Execucao } from '../../domain/entities/execucao';
import { IExecucaoRepository } from '../../domain/repositories/execucao-repository.interface';
import { IHistoricoIntervencaoRepository } from '../../domain/repositories/historico-intervencao-repository.interface';

/**
 * Reage ao PagamentoAprovadoEvent (Saga): o pagamento da OS foi aprovado,
 * o reparo entra na fila de producao.
 */
export class EntrarNaFila {
  constructor(
    private execucaoRepo: IExecucaoRepository,
    private historicoRepo: IHistoricoIntervencaoRepository,
  ) {}

  async execute(ordemServicoId: string): Promise<Execucao> {
    const existente =
      await this.execucaoRepo.getByOrdemServicoId(ordemServicoId);
    if (existente) return existente; // idempotente - webhook/evento duplicado

    const execucao = new Execucao(generateId(), ordemServicoId);
    await this.execucaoRepo.save(execucao);
    await this.historicoRepo.registrar(execucao.id, execucao.getStatus());
    return execucao;
  }
}
