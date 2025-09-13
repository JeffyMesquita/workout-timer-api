-- Script de inicialização do banco de dados
-- Este arquivo é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- O Prisma irá criar as tabelas automaticamente através das migrações
-- Este arquivo serve apenas para configurações iniciais do banco
