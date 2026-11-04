import { InMemoryExecucaoRepository } from './in-memory-execucao-repository';
import { InMemoryHistoricoIntervencaoRepository } from './in-memory-historico-intervencao-repository';
import { PrismaExecucaoRepository } from './repositories/prisma-execucao.repository';
import { PrismaHistoricoIntervencaoRepository } from './repositories/prisma-historico-intervencao.repository';
import { PrismaService } from './prisma/prisma.service';
import { SnsPublisherService } from './saga/sns-publisher.service';
import { IExecucaoRepository } from '../domain/repositories/execucao-repository.interface';
import { IHistoricoIntervencaoRepository } from '../domain/repositories/historico-intervencao-repository.interface';
import { SagaPublisher } from '../application/ports/saga-publisher';

// Implementacoes padrao: in-memory (usadas pelos testes unitarios, sem
// dependencia de banco). Em runtime, `useDatabaseRepositories()` troca para
// as implementacoes Prisma no bootstrap.
export let execucaoRepo: IExecucaoRepository = new InMemoryExecucaoRepository();
export let historicoRepo: IHistoricoIntervencaoRepository =
  new InMemoryHistoricoIntervencaoRepository();

export const sagaPublisher: SagaPublisher = new SnsPublisherService();

/**
 * Substitui os repositorios in-memory pelas implementacoes Prisma. Deve
 * ser chamado no bootstrap (main.ts) ANTES de `NestFactory.create`.
 */
export function useDatabaseRepositories(prisma: PrismaService) {
  execucaoRepo = new PrismaExecucaoRepository(prisma);
  historicoRepo = new PrismaHistoricoIntervencaoRepository(prisma);
}

export async function resetInMemoryRepositories() {
  await execucaoRepo.clear();
  await historicoRepo.clear();
}
