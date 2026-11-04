import { StatusExecucao } from '../entities/execucao';

export interface IHistoricoIntervencaoRepository {
  registrar(
    execucaoId: string,
    status: StatusExecucao,
    observacao?: string,
  ): Promise<void>;
  clear(): Promise<void>;
}
