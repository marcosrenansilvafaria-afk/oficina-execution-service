import { SqsConsumerService } from './sqs-consumer.service';
import { execucaoRepo } from '../singletons';
import { Execucao } from '../../domain/entities/execucao';

jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  ReceiveMessageCommand: jest.fn(),
  DeleteMessageCommand: jest.fn(),
}));

async function despachar(service: SqsConsumerService, envelope: unknown) {
  await (
    service as unknown as { despachar(e: unknown): Promise<void> }
  ).despachar(envelope);
}

describe('SqsConsumerService', () => {
  let service: SqsConsumerService;

  beforeEach(async () => {
    service = new SqsConsumerService();
    await execucaoRepo.clear();
  });

  it('PagamentoAprovadoEvent coloca a OS na fila de producao', async () => {
    await despachar(service, {
      eventId: 'e1',
      eventType: 'PagamentoAprovadoEvent',
      correlationId: 'os-1',
      payload: {},
    });

    const execucao = await execucaoRepo.getByOrdemServicoId('os-1');
    expect(execucao?.getStatus()).toBe('NA_FILA');
  });

  it('CompensarOSEvent cancela a execucao existente', async () => {
    const execucao = new Execucao('exec-1', 'os-2');
    await execucaoRepo.save(execucao);

    await despachar(service, {
      eventId: 'e2',
      eventType: 'CompensarOSEvent',
      correlationId: 'os-2',
      payload: { origemFalha: 'EXECUCAO' },
    });

    const atualizado = await execucaoRepo.getByOrdemServicoId('os-2');
    expect(atualizado?.getStatus()).toBe('CANCELADA');
  });

  it('ignora eventos de tipo desconhecido sem lancar erro', async () => {
    await expect(
      despachar(service, {
        eventId: 'e3',
        eventType: 'EventoInexistente',
        correlationId: 'os-3',
        payload: {},
      }),
    ).resolves.toBeUndefined();
  });

  it('usa correlationId como fallback quando o payload nao tem ordemServicoId', async () => {
    await despachar(service, {
      eventId: 'e4',
      eventType: 'PagamentoAprovadoEvent',
      correlationId: 'os-4',
      payload: {},
    });

    const execucao = await execucaoRepo.getByOrdemServicoId('os-4');
    expect(execucao).not.toBeNull();
  });
});
