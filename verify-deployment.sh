#!/bin/bash
# Deployment Verification Script
# This script verifies that the GitHub Pages deployment is correctly configured

set -e

echo "============================================"
echo "GitHub Pages Deployment Verification Script"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

echo "Step 1: Checking repository structure..."
[ -f "package.json" ] && success "package.json exists" || error "package.json not found"
[ -f "vite.config.ts" ] && success "vite.config.ts exists" || error "vite.config.ts not found"
[ -f ".github/workflows/deploy.yml" ] && success "deploy.yml workflow exists" || error "deploy.yml workflow not found"
[ -f "client/public/.nojekyll" ] && success ".nojekyll file exists in client/public/" || error ".nojekyll not found"
echo ""

echo "Step 2: Checking vite.config.ts for correct base path..."
if grep -q "base: process.env.NODE_ENV === 'production' ? '/wealth/' : '/'" vite.config.ts; then
    success "Base path configuration is correct"
else
    error "Base path configuration not found or incorrect"
fi
echo ""

echo "Step 3: Checking deploy.yml workflow configuration..."
# Check for required jobs
if grep -q "jobs:" .github/workflows/deploy.yml && \
   grep -q "build:" .github/workflows/deploy.yml && \
   grep -q "deploy:" .github/workflows/deploy.yml; then
    success "Required jobs (build, deploy) are present"
else
    error "Required jobs not found in deploy.yml"
fi

# Check for correct trigger
if grep -q "on:" .github/workflows/deploy.yml && \
   grep -q "branches:" .github/workflows/deploy.yml && \
   grep -q "main" .github/workflows/deploy.yml; then
    success "Workflow triggers on push to main branch"
else
    error "Workflow trigger not correctly configured"
fi

# Check for permissions
if grep -q "permissions:" .github/workflows/deploy.yml && \
   grep -q "pages: write" .github/workflows/deploy.yml; then
    success "Workflow has correct GitHub Pages permissions"
else
    error "Workflow permissions not correctly configured"
fi
echo ""

echo "Step 4: Installing dependencies..."
if npm ci > /dev/null 2>&1; then
    success "Dependencies installed successfully"
else
    error "Failed to install dependencies"
fi
echo ""

echo "Step 5: Building the application..."
if NODE_ENV=production npm run build > /dev/null 2>&1; then
    success "Build completed successfully"
else
    error "Build failed"
fi
echo ""

echo "Step 6: Verifying build output..."
[ -d "dist" ] && success "dist directory exists" || error "dist directory not found"
[ -f "dist/index.html" ] && success "index.html generated" || error "index.html not found"
[ -f "dist/.nojekyll" ] && success ".nojekyll file in dist" || error ".nojekyll not found in dist"
[ -d "dist/assets" ] && success "assets directory exists" || error "assets directory not found"

# Check for base path in generated HTML
if grep -q "/wealth/" dist/index.html; then
    success "Base path /wealth/ correctly set in generated HTML"
else
    error "Base path /wealth/ not found in generated HTML"
fi

# Count generated files
FILE_COUNT=$(find dist -type f | wc -l)
if [ "$FILE_COUNT" -gt 10 ]; then
    success "Build generated $FILE_COUNT files"
else
    error "Build generated only $FILE_COUNT files (expected more)"
fi
echo ""

echo "============================================"
echo -e "${GREEN}All verification checks passed!${NC}"
echo "============================================"
echo ""
echo "Deployment Configuration Summary:"
echo "  - Workflow: .github/workflows/deploy.yml"
echo "  - Trigger: Push to main branch"
echo "  - Build output: dist/"
echo "  - Base path: /wealth/"
echo "  - GitHub Pages method: GitHub Actions"
echo ""
echo "Next Steps:"
echo "  1. Ensure GitHub Pages is enabled in repository settings"
echo "  2. Set Pages source to 'GitHub Actions'"
echo "  3. Merge to main branch to trigger deployment"
echo "  4. Access site at: https://<username>.github.io/wealth/"
echo ""
