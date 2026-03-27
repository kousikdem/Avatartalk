#!/bin/bash
# Deployment Validation Script
# Ensures the app is ready for deployment without npm conflicts

set -e

echo "🔍 Running Deployment Validation..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: No package-lock.json files
echo "✓ Checking for npm lockfiles..."
if [ -f "/app/frontend/package-lock.json" ] || [ -f "/app/package-lock.json" ]; then
    echo -e "${RED}❌ ERROR: package-lock.json found. Use yarn.lock only.${NC}"
    echo "   Run: rm -f /app/frontend/package-lock.json /app/package-lock.json"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}  ✓ No npm lockfiles found${NC}"
fi

# Check 2: No .npmrc file
echo "✓ Checking for .npmrc..."
if [ -f "/app/frontend/.npmrc" ]; then
    echo -e "${RED}❌ ERROR: .npmrc found. Use .yarnrc instead.${NC}"
    echo "   Run: rm -f /app/frontend/.npmrc"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}  ✓ No .npmrc found${NC}"
fi

# Check 3: Yarn lock exists
echo "✓ Checking for yarn.lock..."
if [ ! -f "/app/frontend/yarn.lock" ]; then
    echo -e "${RED}❌ ERROR: yarn.lock not found.${NC}"
    echo "   Run: cd /app/frontend && yarn install"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}  ✓ yarn.lock exists${NC}"
fi

# Check 4: package.json scripts use yarn
echo "✓ Checking package.json scripts..."
if grep -q '"npm ' /app/frontend/package.json; then
    echo -e "${YELLOW}⚠️  WARNING: package.json contains 'npm' references${NC}"
fi

# Check 5: vercel.json uses yarn
echo "✓ Checking vercel.json configuration..."
if [ -f "/app/frontend/vercel.json" ]; then
    if grep -q 'yarn' /app/frontend/vercel.json; then
        echo -e "${GREEN}  ✓ vercel.json uses yarn${NC}"
    else
        echo -e "${YELLOW}⚠️  WARNING: vercel.json might not use yarn${NC}"
    fi
fi

# Check 6: Build test
echo "✓ Testing build..."
cd /app/frontend
if yarn build > /tmp/build-test.log 2>&1; then
    echo -e "${GREEN}  ✓ Build successful${NC}"
else
    echo -e "${RED}❌ ERROR: Build failed. Check /tmp/build-test.log${NC}"
    tail -20 /tmp/build-test.log
    ERRORS=$((ERRORS + 1))
fi

# Check 7: Dependencies installed
echo "✓ Checking dependencies..."
if [ -d "/app/frontend/node_modules" ]; then
    echo -e "${GREEN}  ✓ node_modules exists${NC}"
else
    echo -e "${RED}❌ ERROR: node_modules not found${NC}"
    echo "   Run: cd /app/frontend && yarn install"
    ERRORS=$((ERRORS + 1))
fi

# Check 8: Environment variables
echo "✓ Checking environment files..."
if [ -f "/app/frontend/.env" ]; then
    echo -e "${GREEN}  ✓ frontend/.env exists${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: frontend/.env not found${NC}"
fi

if [ -f "/app/backend/.env" ]; then
    echo -e "${GREEN}  ✓ backend/.env exists${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: backend/.env not found${NC}"
fi

# Summary
echo ""
echo "================================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ DEPLOYMENT VALIDATION PASSED${NC}"
    echo "   Your app is ready for deployment!"
    exit 0
else
    echo -e "${RED}❌ DEPLOYMENT VALIDATION FAILED${NC}"
    echo "   Found $ERRORS critical error(s)"
    echo "   Fix the errors above before deploying"
    exit 1
fi
