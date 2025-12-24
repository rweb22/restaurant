#!/bin/bash

# Test Runner Script for Restaurant Management System
# This script runs all tests with the mock OTP service

set -e  # Exit on error

echo "=========================================="
echo "Restaurant Management System - Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run from project root.${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Check if jest is installed
if ! npm list jest > /dev/null 2>&1; then
    echo -e "${YELLOW}Jest not found. Installing test dependencies...${NC}"
    npm install --save-dev jest supertest
fi

echo -e "${BLUE}Setting up test environment...${NC}"
export NODE_ENV=test
export USE_MOCK_OTP=true
export JWT_SECRET=test-secret-key-for-testing-only
export JWT_EXPIRES_IN=30d

echo ""
echo -e "${BLUE}Running tests...${NC}"
echo ""

# Run tests based on argument
case "$1" in
    "unit")
        echo -e "${BLUE}Running unit tests only...${NC}"
        npm run test:unit
        ;;
    "integration")
        echo -e "${BLUE}Running integration tests only...${NC}"
        npm run test:integration
        ;;
    "coverage")
        echo -e "${BLUE}Running tests with coverage...${NC}"
        npm test -- --coverage
        ;;
    "watch")
        echo -e "${BLUE}Running tests in watch mode...${NC}"
        npm run test:watch
        ;;
    *)
        echo -e "${BLUE}Running all tests...${NC}"
        npm test
        ;;
esac

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo -e "✓ All tests passed!"
    echo -e "==========================================${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}=========================================="
    echo -e "✗ Some tests failed!"
    echo -e "==========================================${NC}"
    exit 1
fi

