#!/bin/bash

echo "🚀 Running local CI simulation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Not in project root directory${NC}"
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install --no-frozen-lockfile
print_status $? "Dependencies installed"

echo "🔧 Generating Prisma Client..."
echo 'DATABASE_URL="postgresql://temp:temp@temp:5432/temp"' > .env
pnpm prisma:generate
rm .env
print_status $? "Prisma Client generated"

echo "🔍 Running TypeScript check..."
pnpm type-check
print_status $? "TypeScript check"

echo "📝 Running ESLint..."
pnpm lint:check
print_status $? "ESLint check"

echo "🎨 Running Prettier check..."
pnpm format:check
print_status $? "Prettier check"

echo "🧪 Running unit tests..."
pnpm test:unit
print_status $? "Unit tests"

echo "🏗️ Building application..."
pnpm build
print_status $? "Build"

echo ""
echo -e "${GREEN}🎉 All CI checks passed locally!${NC}"
echo -e "${YELLOW}📤 Ready to push to GitHub${NC}"
