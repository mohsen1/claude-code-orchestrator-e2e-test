#!/bin/bash

# Build script for Calculator TypeScript project
# This script compiles TypeScript and validates the output

set -e  # Exit on error

echo "====================================="
echo "Calculator Project Build Script"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clean previous build
echo -e "${BLUE}Step 1: Cleaning previous build...${NC}"
npm run clean
echo -e "${GREEN}✓ Clean complete${NC}"
echo ""

# Step 2: Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${BLUE}Step 2: Dependencies already installed, skipping...${NC}"
fi
echo ""

# Step 3: Compile TypeScript
echo -e "${BLUE}Step 3: Compiling TypeScript...${NC}"
npm run build
echo -e "${GREEN}✓ TypeScript compilation complete${NC}"
echo ""

# Step 4: Verify build output
echo -e "${BLUE}Step 4: Verifying build output...${NC}"
if [ -f "dist/calculator.js" ]; then
    echo -e "${GREEN}✓ dist/calculator.js found${NC}"
    echo "  File size: $(wc -c < dist/calculator.js) bytes"
else
    echo -e "${RED}✗ dist/calculator.js not found${NC}"
    exit 1
fi

if [ -f "dist/calculator.d.ts" ]; then
    echo -e "${GREEN}✓ dist/calculator.d.ts found${NC}"
    echo "  File size: $(wc -c < dist/calculator.d.ts) bytes"
else
    echo -e "${RED}✗ dist/calculator.d.ts not found${NC}"
    exit 1
fi
echo ""

# Step 5: Validate JavaScript syntax
echo -e "${BLUE}Step 5: Validating JavaScript syntax...${NC}"
node -c dist/calculator.js
echo -e "${GREEN}✓ JavaScript syntax is valid${NC}"
echo ""

echo "====================================="
echo -e "${GREEN}Build completed successfully!${NC}"
echo "====================================="
echo ""
echo "Build artifacts:"
ls -lh dist/
echo ""
