import { StatusExecucao } from '../../domain/entities/execucao';
import { IHistoricoIntervencaoRepository } from '../../domain/repositories/historico-intervencao-repository.interface';
import { PrismaService } from '../prisma/prisma.service';

export class PrismaHistoricoIntervencaoRepository implements IHistoricoIntervencaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(
    execucaoId: string,
    status: StatusExecucao,
    observacao?: string,
  ): Promise<void> {
    await this.prisma.historicoIntervencao.create({
      data: { execucaoId, status, observacao },
    });
  }

  clear(): Promise<void> {
    return Promise.reject(
      new Error('clear() nao e suportado pelo repositorio Prisma real'),
    );
  }
}
