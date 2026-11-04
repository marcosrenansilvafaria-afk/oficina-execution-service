-- Bootstrap do database dedicado do Execution Service na RDS compartilhada
-- (Repositorio 1 - oficina-db-infrastructure). Roda UMA UNICA VEZ, como
-- usuario master da RDS, de DENTRO da VPC (a RDS e privada - nem o GitHub
-- Actions nem uma maquina local fora da VPC conseguem conectar direto).
--
-- Quando o EKS (Repositorio 3) existir, execute via um pod temporario no
-- namespace "oficina":
--
--   kubectl run psql-bootstrap --rm -it --restart=Never -n oficina \
--     --image=postgres:16-alpine -- \
--     psql "postgresql://<usuario_master>:<senha_master>@<host_rds>:5432/oficina" \
--     -f - < scripts/bootstrap-database.sql
--
-- (ou cole o conteudo deste arquivo direto no psql interativo do pod).
--
-- Troque <SENHA_FORTE_AQUI> por uma senha gerada (ex: openssl rand -base64 24)
-- ANTES de rodar, e guarde o valor final em DATABASE_URL (GitHub Secret
-- deste repositorio) - nunca comite a senha real neste arquivo.

CREATE DATABASE execution_service;

CREATE ROLE execution_service_app WITH LOGIN PASSWORD '<SENHA_FORTE_AQUI>';

-- Isolamento: execution_service_app so tem permissao no database
-- execution_service, nenhum outro servico/usuario acessa este database
-- diretamente (requisito da Sprint 4: "NENHUM outro microsservico acessa
-- esta base diretamente").
GRANT ALL PRIVILEGES ON DATABASE execution_service TO execution_service_app;

\c execution_service

GRANT ALL ON SCHEMA public TO execution_service_app;
