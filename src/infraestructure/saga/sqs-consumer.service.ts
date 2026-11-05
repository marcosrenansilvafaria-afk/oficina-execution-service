import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  Message,
} from '@aws-sdk/client-sqs';
import { EntrarNaFila } from '../../application/use-cases/entrar-na-fila';
import { CompensarExecucao } from '../../application/use-cases/compensar-execucao';
import { execucaoRepo, historicoRepo } from '../singletons';
import { integracaoErrosTotal } from '../observability/metrics-registry';

interface SagaEventEnvelope {
  eventId: string;
  eventType: string;
  correlationId: string;
  payload: Record<string, unknown>;
}

/**
 * Consome a fila SQS FIFO deste servico (oficina-saga-execution-service.fifo,
 * provisionada em oficina-messaging-infra) via long-polling. Mesmo padrao
 * do oficina-os-service/oficina-billing-service.
 */
@Injectable()
export class SqsConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SqsConsumerService.name);
  private readonly client: SQSClient;
  private readonly queueUrl = process.env.SAGA_QUEUE_URL || '';
  private stopped = false;

  private readonly entrarNaFila = new EntrarNaFila(execucaoRepo, historicoRepo);
  private readonly compensarExecucao = new CompensarExecucao(
    execucaoRepo,
    historicoRepo,
  );

  constructor() {
    this.client = new SQSClient({
      region: process.env.AWS_REGION || 'us-east-1',
    });
  }

  onModuleInit() {
    if (!this.queueUrl) {
      this.logger.warn(
        'SAGA_QUEUE_URL nao configurada - consumidor do Saga desabilitado (ambiente de dev local).',
      );
      return;
    }
    void this.poll();
  }

  onModuleDestroy() {
    this.stopped = true;
  }

  private async poll(): Promise<void> {
    while (!this.stopped) {
      try {
        const result = await this.client.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 5,
            WaitTimeSeconds: 20,
          }),
        );

        for (const message of result.Messages ?? []) {
          await this.processar(message);
        }
      } catch (err) {
        this.logger.error('Erro ao consumir fila do Saga', err as Error);
        integracaoErrosTotal.inc({ integracao: 'saga-sqs-consumer' });
      }
    }
  }

  private async processar(message: Message): Promise<void> {
    if (!message.Body) return;

    try {
      const envelope = JSON.parse(message.Body) as SagaEventEnvelope;
      await this.despachar(envelope);

      await this.client.send(
        new DeleteMessageCommand({
          QueueUrl: this.queueUrl,
          ReceiptHandle: message.ReceiptHandle,
        }),
      );
    } catch (err) {
      this.logger.error(
        `Falha ao processar evento do Saga (ficara na fila para retry/DLQ): ${(err as Error).message}`,
      );
      integracaoErrosTotal.inc({ integracao: 'saga-sqs-consumer' });
    }
  }

  private async despachar(envelope: SagaEventEnvelope): Promise<void> {
    const { eventType, payload, correlationId } = envelope;
    const ordemServicoId =
      (payload.ordemServicoId as string | undefined) ?? correlationId;

    this.logger.log({ correlationId, eventType }, 'Processando evento do Saga');

    switch (eventType) {
      case 'PagamentoAprovadoEvent':
        await this.entrarNaFila.execute(ordemServicoId);
        break;
      case 'CompensarOSEvent':
        await this.compensarExecucao.execute(ordemServicoId);
        break;
      default:
        this.logger.warn(`Evento do Saga nao reconhecido: ${eventType}`);
        return;
    }

    this.logger.log(
      { correlationId, eventType },
      'Evento do Saga processado com sucesso',
    );
  }
}
