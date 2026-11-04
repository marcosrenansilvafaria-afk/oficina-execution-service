import { InMemoryExecucaoRepository } from '../../infraestructure/in-memory-execucao-repository';
import { InMemoryHistoricoIntervencaoRepository } from '../../infraestructure/in-memory-historico-intervencao-repository';
import { FakeSagaPublisher } from '../ports/fake-saga-publisher';
import { EntrarNaFila } from './entrar-na-fila';
import { IniciarExecucao } from './iniciar-execucao';
import { CompensarExecucao } from './compensar-execucao';

describe('CompensarExecucao', () => {
  it('nao faz nada quando nao existe execucao para a OS (origemFalha=PAGAMENTO)', async () => {
    const execucaoRepo = new InMemoryExecucaoRepository();
    const historicoRepo = new InMemoryHistoricoIntervencaoRepository();
    const useCase = new CompensarExecucao(execucaoRepo, historicoRepo);

    await expect(useCase.execute('os-inexistente')).resolves.toBeUndefined();
  });

  it('cancela uma execucao NA_FILA/EM_EXECUCAO', async () => {
    const execucaoRepo = new InMemoryExecucaoRepository();
    const historicoRepo = new InMemoryHistoricoIntervencaoRepository();
    const execucao = await new EntrarNaFila(
      execucaoRepo,
      historicoRepo,
    ).execute('os-1');

    await new CompensarExecucao(execucaoRepo, historicoRepo).execute('os-1');

    const atualizada = await execucaoRepo.getById(execucao.id);
    expect(atualizada?.getStatus()).toBe('CANCELADA');
  });

  it('nao faz nada quando a execucao ja esta CONCLUIDA ou CANCELADA (eco idempotente)', async () => {
    const execucaoRepo = new InMemoryExecucaoRepository();
    const historicoRepo = new InMemoryHistoricoIntervencaoRepository();
    const sagaPublisher = new FakeSagaPublisher();

    const execucao = await new EntrarNaFila(
      execucaoRepo,
      historicoRepo,
    ).execute('os-1');
    await new IniciarExecucao(
      execucaoRepo,
      historicoRepo,
      sagaPublisher,
    ).execute(execucao.id);
    await new CompensarExecucao(execucaoRepo, historicoRepo).execute('os-1');

    // segunda compensacao (eco) nao deve lancar erro nem mudar nada
    await new CompensarExecucao(execucaoRepo, historicoRepo).execute('os-1');

    const atualizada = await execucaoRepo.getById(execucao.id);
    expect(atualizada?.getStatus()).toBe('CANCELADA');
  });
});
