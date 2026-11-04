import { StatusExecucao } from './execucao';

/**
 * Registro append-only de cada intervencao/transicao de status de uma
 * Execucao - mesmo padrao de OrdemServicoStatusHistorico no OS Service.
 */
export class HistoricoIntervencao {
  constructor(
    public readonly id: string,
    public readonly execucaoId: string,
    public readonly status: StatusExecucao,
    public readonly observacao?: string,
    public readonly registradoEm: Date = new Date(),
  ) {}
}
