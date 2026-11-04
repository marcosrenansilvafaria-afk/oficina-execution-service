import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

/**
 * Registro de metricas Prometheus. Singleton simples (mesmo padrao dos
 * outros microsservicos), sem depender do container de DI do Nest.
 */
export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

export const execucoesIniciadasTotal = new Counter({
  name: 'oficina_execution_execucoes_iniciadas_total',
  help: 'Total de execucoes (reparos) iniciadas na fila de producao',
  registers: [metricsRegistry],
});

export const execucoesConcluidasTotal = new Counter({
  name: 'oficina_execution_execucoes_concluidas_total',
  help: 'Total de execucoes concluidas com sucesso',
  registers: [metricsRegistry],
});

export const execucaoDuracaoSegundos = new Histogram({
  name: 'oficina_execution_duracao_segundos',
  help: 'Duracao (segundos) da execucao do reparo, do inicio a conclusao',
  buckets: [60, 300, 900, 3600, 21600, 86400],
  registers: [metricsRegistry],
});

export const integracaoErrosTotal = new Counter({
  name: 'oficina_integration_errors_total',
  help: 'Total de erros/falhas em integracoes externas (dashboard: taxa de erros e falhas em integracoes)',
  labelNames: ['integracao'],
  registers: [metricsRegistry],
});

export const httpRequestDuracaoSegundos = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duracao das requisicoes HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});
