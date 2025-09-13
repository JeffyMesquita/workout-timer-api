# Use Node.js 20 Alpine como base
FROM node:20-alpine AS base

# Instalar dependências necessárias para Prisma no Alpine
RUN apk add --no-cache openssl libc6-compat

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.0.0

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN --mount=type=cache,target=/root/.pnpm-store pnpm install --no-frozen-lockfile

# Copiar código fonte
COPY . .

# Criar arquivo .env temporário para o build (será substituído pelas env vars do container)
RUN echo 'DATABASE_URL="postgresql://temp:temp@temp:5432/temp"' > .env

# Gerar cliente Prisma
RUN pnpm prisma:generate

# Build da aplicação
RUN pnpm build

# Remover arquivo .env temporário
RUN rm .env

# Estágio de produção
FROM node:20-alpine AS production

# Instalar dependências necessárias para Prisma no Alpine
RUN apk add --no-cache openssl libc6-compat

# Instalar pnpm globalmente
RUN npm install -g pnpm@10.0.0

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar apenas dependências de produção
RUN --mount=type=cache,target=/root/.pnpm-store pnpm install --no-frozen-lockfile --prod

# Copiar código buildado e arquivos necessários
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma

# Gerar cliente Prisma
RUN pnpm prisma:generate

# Mudar para usuário não-root
USER nestjs

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["pnpm", "start"]
