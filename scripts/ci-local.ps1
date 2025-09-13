# PowerShell script for local CI simulation on Windows

Write-Host "🚀 Running local CI simulation..." -ForegroundColor Cyan

function Test-Command {
    param($Command, $Description)

    Write-Host "Running: $Description..." -ForegroundColor Yellow

    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Description" -ForegroundColor Green
        } else {
            Write-Host "❌ $Description failed" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ $Description failed: $_" -ForegroundColor Red
        exit 1
    }
}

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Not in project root directory" -ForegroundColor Red
    exit 1
}

Test-Command "pnpm install --no-frozen-lockfile" "Dependencies installation"

Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
Set-Content -Path ".env" -Value 'DATABASE_URL="postgresql://temp:temp@temp:5432/temp"'
Test-Command "pnpm prisma:generate" "Prisma Client generation"
Remove-Item ".env" -ErrorAction SilentlyContinue

Test-Command "pnpm type-check" "TypeScript check"
Test-Command "pnpm lint:check" "ESLint check"
Test-Command "pnpm format:check" "Prettier check"
Test-Command "pnpm test:unit" "Unit tests"
Test-Command "pnpm build" "Application build"

Write-Host ""
Write-Host "🎉 All CI checks passed locally!" -ForegroundColor Green
Write-Host "📤 Ready to push to GitHub" -ForegroundColor Yellow
