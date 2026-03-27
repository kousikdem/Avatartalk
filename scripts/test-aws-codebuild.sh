#!/bin/bash
# AWS CodeBuild Troubleshooting Script
# Run this locally to simulate AWS CodeBuild environment

set -e

echo "=========================================="
echo "AWS CodeBuild Environment Simulation"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: Verify buildspec.yml exists
echo "1. Checking for buildspec.yml..."
if [ -f "/app/buildspec.yml" ]; then
    echo -e "${GREEN}✓ buildspec.yml found${NC}"
else
    echo -e "${RED}✗ buildspec.yml not found${NC}"
    echo "  Run: Create buildspec.yml in project root"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Verify Node.js version
echo "2. Checking Node.js version..."
NODE_VERSION=$(node -v)
if [[ $NODE_VERSION == v20* ]]; then
    echo -e "${GREEN}✓ Node.js 20.x detected: $NODE_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Node.js version: $NODE_VERSION (AWS CodeBuild uses 20.x)${NC}"
fi

# Check 3: Verify Yarn is installed
echo "3. Checking Yarn installation..."
if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    echo -e "${GREEN}✓ Yarn installed: v$YARN_VERSION${NC}"
else
    echo -e "${RED}✗ Yarn not found${NC}"
    echo "  AWS CodeBuild will install it, but test locally:"
    echo "  npm install -g yarn@1.22.22"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: Verify no npm artifacts
echo "4. Checking for npm artifacts..."
if [ -f "/app/frontend/package-lock.json" ] || [ -f "/app/package-lock.json" ]; then
    echo -e "${RED}✗ package-lock.json found (should not exist)${NC}"
    echo "  Run: rm -f /app/frontend/package-lock.json /app/package-lock.json"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ No npm lockfiles${NC}"
fi

# Check 5: Verify yarn.lock exists
echo "5. Checking for yarn.lock..."
if [ -f "/app/frontend/yarn.lock" ]; then
    echo -e "${GREEN}✓ yarn.lock found${NC}"
else
    echo -e "${RED}✗ yarn.lock not found${NC}"
    echo "  Run: cd /app/frontend && yarn install"
    ERRORS=$((ERRORS + 1))
fi

# Check 6: Test dependency installation
echo "6. Testing dependency installation..."
cd /app/frontend
if timeout 120 yarn install --frozen-lockfile --network-timeout 300000 > /tmp/yarn-test.log 2>&1; then
    echo -e "${GREEN}✓ Dependencies install successfully${NC}"
else
    echo -e "${RED}✗ Dependency installation failed${NC}"
    echo "  Check /tmp/yarn-test.log for details"
    tail -20 /tmp/yarn-test.log
    ERRORS=$((ERRORS + 1))
fi

# Check 7: Verify environment variables
echo "7. Checking required environment variables..."
REQUIRED_VARS=("VITE_SUPABASE_URL" "VITE_SUPABASE_PUBLISHABLE_KEY" "VITE_SUPABASE_PROJECT_ID" "VITE_SITE_URL")
ENV_MISSING=0

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" /app/frontend/.env 2>/dev/null; then
        echo -e "  ${GREEN}✓ $var${NC}"
    else
        echo -e "  ${RED}✗ $var not found in .env${NC}"
        ENV_MISSING=$((ENV_MISSING + 1))
    fi
done

if [ $ENV_MISSING -gt 0 ]; then
    echo -e "${YELLOW}⚠ Missing $ENV_MISSING environment variables${NC}"
    echo "  These must be configured in AWS CodeBuild Environment settings"
else
    echo -e "${GREEN}✓ All required variables present in .env${NC}"
fi

# Check 8: Test build
echo "8. Testing build process..."
cd /app/frontend
if timeout 300 yarn build > /tmp/build-test.log 2>&1; then
    echo -e "${GREEN}✓ Build successful${NC}"
    
    # Check dist directory
    if [ -d "dist" ]; then
        DIST_SIZE=$(du -sh dist | cut -f1)
        echo -e "  Build output size: $DIST_SIZE"
        FILE_COUNT=$(find dist -type f | wc -l)
        echo -e "  File count: $FILE_COUNT files"
    fi
else
    echo -e "${RED}✗ Build failed${NC}"
    echo "  Check /tmp/build-test.log for details"
    tail -30 /tmp/build-test.log
    ERRORS=$((ERRORS + 1))
fi

# Check 9: Verify artifacts structure
echo "9. Checking artifacts structure..."
if [ -d "/app/frontend/dist" ]; then
    if [ -f "/app/frontend/dist/index.html" ]; then
        echo -e "${GREEN}✓ Artifacts structure correct (dist/index.html exists)${NC}"
    else
        echo -e "${RED}✗ dist/index.html not found${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗ dist directory not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 10: Estimate CodeBuild compute requirements
echo "10. Estimating CodeBuild compute requirements..."
BUILD_TIME=$(grep "built in" /tmp/build-test.log 2>/dev/null | tail -1 || echo "unknown")
echo "  Local build time: $BUILD_TIME"

MEMORY_USAGE=$(ps aux | grep -E "node|vite" | awk '{sum+=$6} END {print sum/1024}' | cut -d. -f1)
if [ ! -z "$MEMORY_USAGE" ] && [ "$MEMORY_USAGE" -gt 0 ]; then
    echo "  Estimated memory usage: ${MEMORY_USAGE}MB"
    
    if [ "$MEMORY_USAGE" -gt 2048 ]; then
        echo -e "  ${YELLOW}⚠ Recommend: 7 GB CodeBuild instance${NC}"
    else
        echo -e "  ${GREEN}✓ Recommend: 3 GB CodeBuild instance${NC}"
    fi
fi

# Summary
echo ""
echo "=========================================="
echo "Summary"
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed${NC}"
    echo ""
    echo "Your application is ready for AWS CodeBuild deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Create CodeBuild project in AWS Console"
    echo "2. Set environment variables in CodeBuild"
    echo "3. Connect your Git repository"
    echo "4. Start build"
    echo ""
    echo "See AWS_CODEBUILD_GUIDE.md for detailed setup instructions"
else
    echo -e "${RED}❌ Found $ERRORS issue(s)${NC}"
    echo ""
    echo "Fix the issues above before deploying to AWS CodeBuild"
fi

echo ""
echo "Log files for review:"
echo "  - Dependency install: /tmp/yarn-test.log"
echo "  - Build output: /tmp/build-test.log"

exit $ERRORS
