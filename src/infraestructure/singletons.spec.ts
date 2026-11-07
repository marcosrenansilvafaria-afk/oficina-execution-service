import * as singletons from './singletons';
import { PrismaService } from './prisma/prisma.service';

describe('singletons', () => {
  it('resetInMemoryRepositories() limpa os repositorios in-memory', async () => {
    await expect(
      singletons.resetInMemoryRepositories(),
    ).resolves.toBeUndefined();
  });

  it('useDatabaseRepositories() troca para as implementacoes Prisma', () => {
    const prisma = {} as PrismaService;

    expect(() => singletons.useDatabaseRepositories(prisma)).not.toThrow();
  });
});
