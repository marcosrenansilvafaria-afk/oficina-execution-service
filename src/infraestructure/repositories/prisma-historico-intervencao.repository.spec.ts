import { PrismaHistoricoIntervencaoRepository } from './prisma-historico-intervencao.repository';
import { PrismaService } from '../prisma/prisma.service';

interface CreateArg {
  data: { execucaoId: string; status: string; observacao?: string };
}

function buildPrismaMock() {
  return {
    historicoIntervencao: {
      create: jest.fn<Promise<void>, [CreateArg]>(),
    },
  };
}

function buildRepo(prisma: ReturnType<typeof buildPrismaMock>) {
  return new PrismaHistoricoIntervencaoRepository(
    prisma as unknown as PrismaService,
  );
}

describe('PrismaHistoricoIntervencaoRepository', () => {
  it('registrar() cria o registro de intervencao com os campos corretos', async () => {
    const prisma = buildPrismaMock();
    const repo = buildRepo(prisma);

    await repo.registrar('exec-1', 'EM_EXECUCAO', 'iniciado pelo mecanico');

    const arg = prisma.historicoIntervencao.create.mock.calls[0][0];
    expect(arg.data.execucaoId).toBe('exec-1');
    expect(arg.data.status).toBe('EM_EXECUCAO');
    expect(arg.data.observacao).toBe('iniciado pelo mecanico');
  });

  it('clear() rejeita - nao suportado no Prisma real', async () => {
    const prisma = buildPrismaMock();
    const repo = buildRepo(prisma);

    await expect(repo.clear()).rejects.toThrow(
      'clear() nao e suportado pelo repositorio Prisma real',
    );
  });
});
