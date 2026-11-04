import { Execucao, StatusExecucao } from '../../domain/entities/execucao';
import { IExecucaoRepository } from '../../domain/repositories/execucao-repository.interface';
import { PrismaService } from '../prisma/prisma.service';

export class PrismaExecucaoRepository implements IExecucaoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(execucao: Execucao): Promise<void> {
    await this.prisma.execucao.upsert({
      where: { id: execucao.id },
      create: {
        id: execucao.id,
        ordemServicoId: execucao.ordemServicoId,
        status: execucao.getStatus(),
        mecanicoId: execucao.getMecanicoId(),
        entradaFilaEm: execucao.entradaFilaEm,
        iniciadaEm: execucao.getIniciadaEm(),
        concluidaEm: execucao.getConcluidaEm(),
      },
      update: {
        status: execucao.getStatus(),
        mecanicoId: execucao.getMecanicoId(),
        iniciadaEm: execucao.getIniciadaEm(),
        concluidaEm: execucao.getConcluidaEm(),
      },
    });
  }

  async getById(id: string): Promise<Execucao | null> {
    const row = await this.prisma.execucao.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async getByOrdemServicoId(ordemServicoId: string): Promise<Execucao | null> {
    const row = await this.prisma.execucao.findUnique({
      where: { ordemServicoId },
    });
    return row ? this.toDomain(row) : null;
  }

  async listAll(): Promise<Execucao[]> {
    const rows = await this.prisma.execucao.findMany({
      orderBy: { entradaFilaEm: 'asc' },
    });
    return rows.map((row) => this.toDomain(row));
  }

  clear(): Promise<void> {
    return Promise.reject(
      new Error('clear() nao e suportado pelo repositorio Prisma real'),
    );
  }

  private toDomain(row: {
    id: string;
    ordemServicoId: string;
    status: string;
    mecanicoId: string | null;
    entradaFilaEm: Date;
    iniciadaEm: Date | null;
    concluidaEm: Date | null;
  }): Execucao {
    return Execucao.reconstitute(
      row.id,
      row.ordemServicoId,
      row.entradaFilaEm,
      row.status as StatusExecucao,
      row.mecanicoId ?? undefined,
      row.iniciadaEm ?? undefined,
      row.concluidaEm ?? undefined,
    );
  }
}
