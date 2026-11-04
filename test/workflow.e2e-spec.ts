import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import {
  resetInMemoryRepositories,
  execucaoRepo,
  historicoRepo,
} from '../src/infraestructure/singletons';
import { EntrarNaFila } from '../src/application/use-cases/entrar-na-fila';

describe('Fluxo da fila de producao (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    await resetInMemoryRepositories();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('mecanico inicia e finaliza a execucao via API', async () => {
    const execucao = await new EntrarNaFila(
      execucaoRepo,
      historicoRepo,
    ).execute('os-1');

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'mecanico@oficina.com', senha: 'mecanico123' })
      .expect(201);

    const token = (loginResponse.body as { access_token: string }).access_token;

    await request(app.getHttpServer())
      .post(`/execucoes/${execucao.id}/iniciar`)
      .set('Authorization', `Bearer ${token}`)
      .send({ mecanicoId: 'mec-1' })
      .expect(201);

    const finalizarResponse = await request(app.getHttpServer())
      .post(`/execucoes/${execucao.id}/finalizar`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect((finalizarResponse.body as { status: string }).status).toBe(
      'CONCLUIDA',
    );
  });
});
