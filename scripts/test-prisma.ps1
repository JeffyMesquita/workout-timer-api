# Script para testar se o Prisma funciona corretamente no Docker

Write-Host "🧪 Testando Prisma no Docker..." -ForegroundColor Green

# Parar containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker-compose down

# Reconstruir com as correções
Write-Host "🔨 Reconstruindo containers..." -ForegroundColor Yellow
docker-compose build --no-cache api

# Iniciar apenas o banco de dados primeiro
Write-Host "🗄️  Iniciando PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d postgres

# Aguardar o banco estar pronto
Write-Host "⏳ Aguardando PostgreSQL estar pronto..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Iniciar a API
Write-Host "🚀 Iniciando API..." -ForegroundColor Yellow
docker-compose up -d api

# Aguardar um pouco para a API inicializar
Write-Host "⏳ Aguardando API inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar logs
Write-Host "📋 Verificando logs da API..." -ForegroundColor Cyan
docker-compose logs api

# Verificar se a API está respondendo
Write-Host "🔍 Testando se a API está respondendo..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✅ API está respondendo! Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  API ainda não está respondendo, verifique os logs acima." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 Para continuar monitorando:" -ForegroundColor Cyan
Write-Host "   docker-compose logs -f api" -ForegroundColor White
