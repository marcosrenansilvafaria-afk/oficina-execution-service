import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { ExecucaoController } from './interfaces/http/execucao.controller';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './infraestructure/observability/logger.module';
import { MetricsController } from './infraestructure/observability/metrics.controller';
import { HealthController } from './infraestructure/observability/health.controller';
import { HttpMetricsInterceptor } from './infraestructure/observability/http-metrics.interceptor';
import { AllExceptionsFilter } from './infraestructure/observability/all-exceptions.filter';
import { PrismaService } from './infraestructure/prisma/prisma.service';
import { SagaModule } from './infraestructure/saga/saga.module';

@Module({
  imports: [LoggerModule, AuthModule, TerminusModule, SagaModule],
  controllers: [ExecucaoController, MetricsController, HealthController],
  providers: [
    PrismaService,
    { provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
