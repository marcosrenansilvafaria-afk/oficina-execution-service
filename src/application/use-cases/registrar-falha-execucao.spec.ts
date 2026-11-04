import { InMemoryExecucaoRepository } from '../../infraestructure/in-memory-execucao-repository';
import { InMemoryHistoricoIntervencaoRepository } from '../../infraestructure/in-memory-historico-intervencao-repository';
import { FakeSagaPublisher } from '../ports/fake-saga-publisher';
import { EntrarNaFila } from './entrar-na-fila';
import { IniciarExecucao } from './iniciar-execucao';
import { RegistrarFalhaExecucao } from './registrar-falha-execucao';

describe('RegistrarFalhaExecucao', () => {
  it('deve cancelar a execucao e publicar CompensarOSEvent com origemFalha=EXECUCAO', async () => {
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

    const useCase = new RegistrarFalhaExecucao(
      execucaoRepo,
      historicoRepo,
      sagaPublisher,
    );
    const atualizada = await useCase.execute(execucao.id, 'peca incompativel');

    expect(atualizada.getStatus()).toBe('CANCELADA');
    const evento = sagaPublisher.eventosPublicados.find(
      (e) => e.eventType === 'CompensarOSEvent',
    );
    expect(evento?.payload).toMatchObject({
      origemFalha: 'EXECUCAO',
      motivo: 'peca incompativel',
    });
  });
});
