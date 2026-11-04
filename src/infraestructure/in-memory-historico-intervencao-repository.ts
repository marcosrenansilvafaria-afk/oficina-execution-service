import { generateId } from '../utils/id';
import { HistoricoIntervencao } from '../domain/entities/historico-intervencao';
import { StatusExecucao } from '../domain/entities/execucao';
import { IHistoricoIntervencaoRepository } from '../domain/repositories/historico-intervencao-repository.interface';

export class InMemoryHistoricoIntervencaoRepository implements IHistoricoIntervencaoRepository {
  private items: HistoricoIntervencao[] = [];

  registrar(
    execucaoId: string,
    status: StatusExecucao,
    observacao?: string,
  ): Promise<void> {
    this.items.push(
      new HistoricoIntervencao(generateId(), execucaoId, status, observacao),
    );
    return Promise.resolve();
  }

  clear(): Promise<void> {
    this.items = [];
    return Promise.resolve();
  }
}
