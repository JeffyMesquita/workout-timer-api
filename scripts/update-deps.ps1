# Script para atualizar dependências do projeto

Write-Host "🔄 Atualizando dependências do projeto..." -ForegroundColor Green

# Remover node_modules e lock file para forçar reinstalação
if (Test-Path "node_modules") {
    Write-Host "🗑️  Removendo node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules
}

if (Test-Path "pnpm-lock.yaml") {
    Write-Host "🗑️  Removendo pnpm-lock.yaml..." -ForegroundColor Yellow
    Remove-Item pnpm-lock.yaml
}

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
pnpm install

# Gerar cliente Prisma
Write-Host "🗄️  Gerando cliente Prisma..." -ForegroundColor Yellow
pnpm prisma:generate

Write-Host "✅ Dependências atualizadas com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🐳 Agora você pode executar:" -ForegroundColor Cyan
Write-Host "   docker-compose up --build -d" -ForegroundColor White
