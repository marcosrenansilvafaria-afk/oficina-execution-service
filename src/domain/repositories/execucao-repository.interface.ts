import { Execucao } from '../entities/execucao';

export interface IExecucaoRepository {
  save(execucao: Execucao): Promise<void>;
  getById(id: string): Promise<Execucao | null>;
  getByOrdemServicoId(ordemServicoId: string): Promise<Execucao | null>;
  listAll(): Promise<Execucao[]>;
  clear(): Promise<void>;
}
