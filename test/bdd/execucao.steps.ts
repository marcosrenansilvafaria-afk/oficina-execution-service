import { join } from 'path';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { InMemoryExecucaoRepository } from '../../src/infraestructure/in-memory-execucao-repository';
import { InMemoryHistoricoIntervencaoRepository } from '../../src/infraestructure/in-memory-historico-intervencao-repository';
import { FakeSagaPublisher } from '../../src/application/ports/fake-saga-publisher';
import { EntrarNaFila } from '../../src/application/use-cases/entrar-na-fila';
import { IniciarExecucao } from '../../src/application/use-cases/iniciar-execucao';
import { FinalizarExecucao } from '../../src/application/use-cases/finalizar-execucao';
import { RegistrarFalhaExecucao } from '../../src/application/use-cases/registrar-falha-execucao';
import { Execucao } from '../../src/domain/entities/execucao';

const feature = loadFeature(join(__dirname, 'execucao.feature'));

defineFeature(feature, (test) => {
  let execucaoRepo: InMemoryExecucaoRepository;
  let historicoRepo: InMemoryHistoricoIntervencaoRepository;
  let sagaPublisher: FakeSagaPublisher;
  let execucao: Execucao;

  beforeEach(() => {
    execucaoRepo = new InMemoryExecucaoRepository();
    historicoRepo = new InMemoryHistoricoIntervencaoRepository();
    sagaPublisher = new FakeSagaPublisher();
  });

  test('Fluxo feliz - fila, execucao e finalizacao', ({
    given,
    when,
    then,
    and,
  }) => {
    const statusDeveSer = (statusEsperado: string) => {
      expect(execucao.getStatus()).toBe(statusEsperado);
    };

    given(
      'que o pagamento da ordem de servico "os-1" foi aprovado',
      async () => {
        execucao = await new EntrarNaFila(execucaoRepo, historicoRepo).execute(
          'os-1',
        );
      },
    );

    when('o mecanico inicia a execucao', async () => {
      execucao = await new IniciarExecucao(
        execucaoRepo,
        historicoRepo,
        sagaPublisher,
      ).execute(execucao.id, 'mec-1');
    });

    then(/^o status da execucao deve ser "(.*)"$/, statusDeveSer);

    and('o evento ExecucaoIniciadaEvent deve ter sido publicado', () => {
      expect(
        sagaPublisher.eventosPublicados.some(
          (e) => e.eventType === 'ExecucaoIniciadaEvent',
        ),
      ).toBe(true);
    });

    when('o mecanico finaliza a execucao', async () => {
      execucao = await new FinalizarExecucao(
        execucaoRepo,
        historicoRepo,
        sagaPublisher,
      ).execute(execucao.id);
    });

    then(/^o status da execucao deve ser "(.*)"$/, statusDeveSer);

    and('o evento ExecucaoConcluidaEvent deve ter sido publicado', () => {
      expect(
        sagaPublisher.eventosPublicados.some(
          (e) => e.eventType === 'ExecucaoConcluidaEvent',
        ),
      ).toBe(true);
    });
  });

  test('Falha tecnica durante o reparo aciona a compensacao', ({
    given,
    when,
    then,
    and,
  }) => {
    given(
      'uma execucao em andamento para a ordem de servico "os-1"',
      async () => {
        execucao = await new EntrarNaFila(execucaoRepo, historicoRepo).execute(
          'os-1',
        );
        execucao = await new IniciarExecucao(
          execucaoRepo,
          historicoRepo,
          sagaPublisher,
        ).execute(execucao.id, 'mec-1');
      },
    );

    when('o mecanico registra uma falha tecnica no reparo', async () => {
      execucao = await new RegistrarFalhaExecucao(
        execucaoRepo,
        historicoRepo,
        sagaPublisher,
      ).execute(execucao.id, 'falha tecnica no reparo');
    });

    then(/^o status da execucao deve ser "(.*)"$/, (statusEsperado: string) => {
      expect(execucao.getStatus()).toBe(statusEsperado);
    });

    and(
      /^o evento CompensarOSEvent com origem "(.*)" deve ter sido publicado$/,
      (origemEsperada: string) => {
        const evento = sagaPublisher.eventosPublicados.find(
          (e) => e.eventType === 'CompensarOSEvent',
        );
        expect(evento?.payload.origemFalha).toBe(origemEsperada);
      },
    );
  });
});
