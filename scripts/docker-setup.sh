#!/bin/bash

# Script para configurar e executar o projeto com Docker

set -e

echo "🚀 Configurando o Workout Timer API com Docker..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente."
    exit 1
fi

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env a partir do exemplo..."
    cp env.example .env
    echo "⚠️  Por favor, edite o arquivo .env com suas configurações antes de continuar."
    echo "   Você pode usar: nano .env ou code .env"
    read -p "Pressione Enter quando terminar de configurar o .env..."
fi

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down 2>/dev/null || true

# Construir e iniciar os serviços
echo "🔨 Construindo e iniciando os serviços..."
docker-compose up --build -d

# Aguardar o banco de dados estar pronto
echo "⏳ Aguardando o banco de dados estar pronto..."
sleep 10

# Executar migrações do Prisma
echo "🗄️  Executando migrações do banco de dados..."
docker-compose exec api pnpm prisma:migrate dev

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
docker-compose exec api pnpm prisma:generate

echo "✅ Setup concluído!"
echo ""
echo "📊 Serviços disponíveis:"
echo "   - API: http://localhost:3000"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "📝 Comandos úteis:"
echo "   - Ver logs: docker-compose logs -f"
echo "   - Parar serviços: docker-compose down"
echo "   - Reiniciar API: docker-compose restart api"
echo "   - Acessar container: docker-compose exec api sh"
