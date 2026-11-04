import { Execucao } from '../domain/entities/execucao';
import { IExecucaoRepository } from '../domain/repositories/execucao-repository.interface';

export class InMemoryExecucaoRepository implements IExecucaoRepository {
  private items = new Map<string, Execucao>();

  save(execucao: Execucao): Promise<void> {
    this.items.set(execucao.id, execucao);
    return Promise.resolve();
  }

  getById(id: string): Promise<Execucao | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }

  getByOrdemServicoId(ordemServicoId: string): Promise<Execucao | null> {
    for (const execucao of this.items.values()) {
      if (execucao.ordemServicoId === ordemServicoId) {
        return Promise.resolve(execucao);
      }
    }
    return Promise.resolve(null);
  }

  listAll(): Promise<Execucao[]> {
    return Promise.resolve(Array.from(this.items.values()));
  }

  clear(): Promise<void> {
    this.items.clear();
    return Promise.resolve();
  }
}
