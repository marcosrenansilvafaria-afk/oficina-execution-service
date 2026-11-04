import { InMemoryExecucaoRepository } from '../../infraestructure/in-memory-execucao-repository';
import { InMemoryHistoricoIntervencaoRepository } from '../../infraestructure/in-memory-historico-intervencao-repository';
import { FakeSagaPublisher } from '../ports/fake-saga-publisher';
import { EntrarNaFila } from './entrar-na-fila';
import { IniciarExecucao } from './iniciar-execucao';
import { FinalizarExecucao } from './finalizar-execucao';

describe('FinalizarExecucao', () => {
  async function prepararExecucaoEmAndamento() {
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

    return { execucaoRepo, historicoRepo, sagaPublisher, execucao };
  }

  it('deve finalizar a execucao e publicar ExecucaoConcluidaEvent', async () => {
    const { execucaoRepo, historicoRepo, sagaPublisher, execucao } =
      await prepararExecucaoEmAndamento();
    const useCase = new FinalizarExecucao(
      execucaoRepo,
      historicoRepo,
      sagaPublisher,
    );

    const atualizada = await useCase.execute(execucao.id);

    expect(atualizada.getStatus()).toBe('CONCLUIDA');
    expect(
      sagaPublisher.eventosPublicados.some(
        (e) => e.eventType === 'ExecucaoConcluidaEvent',
      ),
    ).toBe(true);
  });

  it('deve lancar erro quando a execucao nao existe', async () => {
    const execucaoRepo = new InMemoryExecucaoRepository();
    const historicoRepo = new InMemoryHistoricoIntervencaoRepository();
    const useCase = new FinalizarExecucao(
      execucaoRepo,
      historicoRepo,
      new FakeSagaPublisher(),
    );

    await expect(useCase.execute('nao-existe')).rejects.toThrow(
      'Execução não encontrada',
    );
  });
});
