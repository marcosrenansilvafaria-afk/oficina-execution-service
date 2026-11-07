import { PrismaExecucaoRepository } from './prisma-execucao.repository';
import { Execucao } from '../../domain/entities/execucao';
import { PrismaService } from '../prisma/prisma.service';

interface UpsertArg {
  where: { id: string };
  create: { ordemServicoId: string };
}

function buildPrismaMock() {
  return {
    execucao: {
      upsert: jest.fn<Promise<void>, [UpsertArg]>(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };
}

function buildRepo(prisma: ReturnType<typeof buildPrismaMock>) {
  return new PrismaExecucaoRepository(prisma as unknown as PrismaService);
}

function buildRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'exec-1',
    ordemServicoId: 'os-1',
    status: 'NA_FILA',
    mecanicoId: null,
    entradaFilaEm: new Date(),
    iniciadaEm: null,
    concluidaEm: null,
    ...overrides,
  };
}

describe('PrismaExecucaoRepository', () => {
  it('save() faz upsert com os campos da execucao', async () => {
    const prisma = buildPrismaMock();
    const repo = buildRepo(prisma);
    const execucao = new Execucao('exec-1', 'os-1');

    await repo.save(execucao);

    const arg = prisma.execucao.upsert.mock.calls[0][0];
    expect(arg.where).toEqual({ id: 'exec-1' });
    expect(arg.create.ordemServicoId).toBe('os-1');
  });

  it('getById() retorna null quando o registro nao existe', async () => {
    const prisma = buildPrismaMock();
    prisma.execucao.findUnique.mockResolvedValue(null);
    const repo = buildRepo(prisma);

    expect(await repo.getById('inexistente')).toBeNull();
  });

  it('getById() reconstitui a entidade a partir do registro', async () => {
    const prisma = buildPrismaMock();
    prisma.execucao.findUnique.mockResolvedValue(buildRow());
    const repo = buildRepo(prisma);

    const execucao = await repo.getById('exec-1');

    expect(execucao).toBeInstanceOf(Execucao);
    expect(execucao?.getStatus()).toBe('NA_FILA');
  });

  it('getByOrdemServicoId() retorna null quando o registro nao existe', async () => {
    const prisma = buildPrismaMock();
    prisma.execucao.findUnique.mockResolvedValue(null);
    const repo = buildRepo(prisma);

    expect(await repo.getByOrdemServicoId('os-inexistente')).toBeNull();
  });

  it('getByOrdemServicoId() reconstitui a entidade a partir do registro', async () => {
    const prisma = buildPrismaMock();
    prisma.execucao.findUnique.mockResolvedValue(
      buildRow({
        status: 'EM_EXECUCAO',
        mecanicoId: 'mec-1',
        iniciadaEm: new Date(),
      }),
    );
    const repo = buildRepo(prisma);

    const execucao = await repo.getByOrdemServicoId('os-1');

    expect(execucao?.getMecanicoId()).toBe('mec-1');
  });

  it('listAll() mapeia todos os registros', async () => {
    const prisma = buildPrismaMock();
    prisma.execucao.findMany.mockResolvedValue([buildRow()]);
    const repo = buildRepo(prisma);

    expect(await repo.listAll()).toHaveLength(1);
  });

  it('clear() rejeita - nao suportado no Prisma real', async () => {
    const prisma = buildPrismaMock();
    const repo = buildRepo(prisma);

    await expect(repo.clear()).rejects.toThrow(
      'clear() nao e suportado pelo repositorio Prisma real',
    );
  });
});
