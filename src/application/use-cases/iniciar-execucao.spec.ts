import { InMemoryExecucaoRepository } from '../../infraestructure/in-memory-execucao-repository';
import { InMemoryHistoricoIntervencaoRepository } from '../../infraestructure/in-memory-historico-intervencao-repository';
import { FakeSagaPublisher } from '../ports/fake-saga-publisher';
import { EntrarNaFila } from './entrar-na-fila';
import { IniciarExecucao } from './iniciar-execucao';

describe('IniciarExecucao', () => {
  it('deve iniciar a execucao e publicar ExecucaoIniciadaEvent', async () => {
    const execucaoRepo = new InMemoryExecucaoRepository();
    const historicoRepo = new InMemoryHistoricoIntervencaoRepository();
    const sagaPublisher = new FakeSagaPublisher();

    const execucao = await new EntrarNaFila(
      execucaoRepo,
      historicoRepo,
    ).execute('os-1');
    const useCase = new IniciarExecucao(
      execucaoRepo,
      historicoRepo,
      sagaPublisher,
    );

    const atualizada = await useCase.execute(execucao.id, 'mec-1');

    expect(atualizada.getStatus()).toBe('EM_EXECUCAO');
    expect(sagaPublisher.eventosPublicados).toHaveLength(1);
    expect(sagaPublisher.eventosPublicados[0]).toMatchObject({
      eventType: 'ExecucaoIniciadaEvent',
      correlationId: 'os-1',
    });
  });

  it('deve lancar erro quando a execucao nao existe', async () => {
    const execucaoRepo = new InMemoryExecucaoRepository();
    const historicoRepo = new InMemoryHistoricoIntervencaoRepository();
    const useCase = new IniciarExecucao(
      execucaoRepo,
      historicoRepo,
      new FakeSagaPublisher(),
    );

    await expect(useCase.execute('nao-existe')).rejects.toThrow(
      'Execução não encontrada',
    );
  });
});
