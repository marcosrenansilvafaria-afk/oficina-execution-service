-- CreateEnum
CREATE TYPE "StatusExecucao" AS ENUM ('NA_FILA', 'EM_EXECUCAO', 'CONCLUIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "execucoes" (
    "id" TEXT NOT NULL,
    "ordemServicoId" TEXT NOT NULL,
    "status" "StatusExecucao" NOT NULL DEFAULT 'NA_FILA',
    "mecanicoId" TEXT,
    "entradaFilaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "iniciadaEm" TIMESTAMP(3),
    "concluidaEm" TIMESTAMP(3),

    CONSTRAINT "execucoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_intervencoes" (
    "id" TEXT NOT NULL,
    "execucaoId" TEXT NOT NULL,
    "status" "StatusExecucao" NOT NULL,
    "observacao" TEXT,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_intervencoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "execucoes_ordemServicoId_key" ON "execucoes"("ordemServicoId");

-- CreateIndex
CREATE INDEX "historico_intervencoes_execucaoId_idx" ON "historico_intervencoes"("execucaoId");

-- AddForeignKey
ALTER TABLE "historico_intervencoes" ADD CONSTRAINT "historico_intervencoes_execucaoId_fkey" FOREIGN KEY ("execucaoId") REFERENCES "execucoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
