# Script PowerShell para configurar e executar o projeto com Docker

Write-Host "🚀 Configurando o Workout Timer API com Docker..." -ForegroundColor Green

# Verificar se o Docker está rodando
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker não está rodando. Por favor, inicie o Docker e tente novamente." -ForegroundColor Red
    exit 1
}

# Verificar se o arquivo .env existe
if (-not (Test-Path .env)) {
    Write-Host "📝 Criando arquivo .env a partir do exemplo..." -ForegroundColor Yellow
    Copy-Item env.example .env
    Write-Host "⚠️  Por favor, edite o arquivo .env com suas configurações antes de continuar." -ForegroundColor Yellow
    Write-Host "   Você pode usar: notepad .env ou code .env" -ForegroundColor Yellow
    Read-Host "Pressione Enter quando terminar de configurar o .env"
}

# Parar containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker-compose down 2>$null

# Construir e iniciar os serviços
Write-Host "🔨 Construindo e iniciando os serviços..." -ForegroundColor Green
docker-compose up --build -d

# Aguardar o banco de dados estar pronto
Write-Host "⏳ Aguardando o banco de dados estar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Executar migrações do Prisma
Write-Host "🗄️  Executando migrações do banco de dados..." -ForegroundColor Green
docker-compose exec api pnpm prisma:migrate dev

# Gerar cliente Prisma
Write-Host "🔧 Gerando cliente Prisma..." -ForegroundColor Green
docker-compose exec api pnpm prisma:generate

Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Serviços disponíveis:" -ForegroundColor Cyan
Write-Host "   - API: http://localhost:3000" -ForegroundColor White
Write-Host "   - PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "   - Redis: localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "📝 Comandos úteis:" -ForegroundColor Cyan
Write-Host "   - Ver logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   - Parar serviços: docker-compose down" -ForegroundColor White
Write-Host "   - Reiniciar API: docker-compose restart api" -ForegroundColor White
Write-Host "   - Acessar container: docker-compose exec api sh" -ForegroundColor White
