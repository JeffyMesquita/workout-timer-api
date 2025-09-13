# Script para testar o build da aplicação

Write-Host "🔧 Testando build da aplicação..." -ForegroundColor Green

# Verificar se todas as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    pnpm install
}

# Gerar cliente Prisma
Write-Host "🗄️  Gerando cliente Prisma..." -ForegroundColor Yellow
pnpm prisma:generate

# Testar build
Write-Host "🏗️  Testando build..." -ForegroundColor Yellow
try {
    pnpm build
    Write-Host "✅ Build realizado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no build:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Aplicação pronta para Docker!" -ForegroundColor Green
