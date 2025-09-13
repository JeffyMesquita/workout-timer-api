# Docker Setup - Workout Timer API

Este documento explica como executar o projeto Workout Timer API usando Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Docker Compose (incluído no Docker Desktop)

## 🚀 Início Rápido

### 1. Configuração Automática (Recomendado)

Execute o script de setup automático:

**Windows (PowerShell):**

```powershell
.\scripts\docker-setup.ps1
```

**Linux/macOS:**

```bash
./scripts/docker-setup.sh
```

### 2. Configuração Manual

1. **Copie o arquivo de ambiente:**

   ```bash
   cp env.example .env
   ```

2. **Configure as variáveis de ambiente no arquivo `.env`**

3. **Inicie os serviços:**

   ```bash
   docker-compose up --build -d
   ```

4. **Execute as migrações do banco:**
   ```bash
   docker-compose exec api pnpm prisma:migrate
   ```

## 🐳 Serviços Incluídos

### API (NestJS)

- **Porta:** 3000
- **URL:** http://localhost:3000
- **Container:** workout-timer-api

### PostgreSQL

- **Porta:** 5432
- **Database:** workout_timer
- **Usuário:** postgres
- **Senha:** postgres123
- **Container:** workout-timer-postgres

### Redis (Opcional)

- **Porta:** 6379
- **Container:** workout-timer-redis

## 📝 Comandos Úteis

### Gerenciamento de Containers

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f api

# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### Desenvolvimento

```bash
# Acessar o container da API
docker-compose exec api sh

# Executar comandos no container
docker-compose exec api pnpm prisma:generate
docker-compose exec api pnpm test

# Reiniciar apenas a API
docker-compose restart api
```

### Banco de Dados

```bash
# Executar migrações
docker-compose exec api pnpm prisma:migrate

# Reset do banco de dados
docker-compose exec api pnpm prisma:migrate reset

# Acessar o banco via psql
docker-compose exec postgres psql -U postgres -d workout_timer
```

## 🔧 Configuração de Desenvolvimento

Para desenvolvimento, use o arquivo `docker-compose.dev.yml`:

```bash
# Iniciar apenas o banco e Redis para desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Executar a API localmente
pnpm dev
```

## 🌍 Variáveis de Ambiente

As principais variáveis que você precisa configurar no arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/workout_timer?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=your-apple-private-key
```

## 🐛 Troubleshooting

### Problema: Container não inicia

```bash
# Ver logs detalhados
docker-compose logs api

# Reconstruir containers
docker-compose down
docker-compose up --build
```

### Problema: Incompatibilidade de versões do Fastify

Se você encontrar erros como "fastify-plugin: @fastify/cors - expected '5.x' fastify version":

**Windows:**

```powershell
.\scripts\update-deps.ps1
docker-compose up --build -d
```

**Linux/macOS:**

```bash
# Remover dependências antigas
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm prisma:generate
docker-compose up --build -d
```

### Problema: Banco de dados não conecta

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs do PostgreSQL
docker-compose logs postgres
```

### Problema: Migrações falham

```bash
# Resetar o banco e executar migrações novamente
docker-compose exec api pnpm prisma:migrate reset
```

## 📊 Monitoramento

### Health Checks

- PostgreSQL: Verifica se o banco está pronto para conexões
- API: Verifica se a aplicação está respondendo

### Logs

Os logs são salvos no diretório `./logs` (mapeado como volume).

## 🔒 Segurança

⚠️ **Importante:** As configurações padrão são apenas para desenvolvimento. Para produção:

1. Altere todas as senhas padrão
2. Use secrets do Docker ou variáveis de ambiente seguras
3. Configure SSL/TLS
4. Use um banco de dados externo gerenciado
5. Configure firewalls adequadamente
