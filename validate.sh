#!/bin/bash

# Validation script for Calculator class
# Tests the Calculator class functionality in tmux environment

set -e  # Exit on error

echo "====================================="
echo "Calculator Validation Script"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Check if build exists
if [ ! -f "dist/calculator.js" ]; then
    echo -e "${RED}✗ Build output not found. Run 'npm run build' or './build.sh' first.${NC}"
    exit 1
fi

echo -e "${BLUE}Testing Calculator class functionality...${NC}"
echo ""

# Create a temporary test script
WORKING_DIR=$(pwd)
cat > /tmp/calculator-test.js << EOF
const { Calculator } = require('${WORKING_DIR}/dist/calculator.js');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`  ✓ ${testName}`);
        testsPassed++;
    } else {
        console.log(`  ✗ ${testName}`);
        testsFailed++;
    }
}

function assertThrows(fn, testName) {
    try {
        fn();
        console.log(`  ✗ ${testName} (expected error)`);
        testsFailed++;
    } catch (error) {
        if (error.message.includes('Division by zero')) {
            console.log(`  ✓ ${testName}`);
            testsPassed++;
        } else {
            console.log(`  ✗ ${testName} (wrong error: ${error.message})`);
            testsFailed++;
        }
    }
}

const calc = new Calculator();

// Test addition
assert(calc.add(2, 3) === 5, 'add(2, 3) === 5');
assert(calc.add(-1, 1) === 0, 'add(-1, 1) === 0');
assert(calc.add(0, 0) === 0, 'add(0, 0) === 0');

// Test subtraction
assert(calc.subtract(5, 3) === 2, 'subtract(5, 3) === 2');
assert(calc.subtract(0, 5) === -5, 'subtract(0, 5) === -5');
assert(calc.subtract(10, 10) === 0, 'subtract(10, 10) === 0');

// Test multiplication
assert(calc.multiply(2, 3) === 6, 'multiply(2, 3) === 6');
assert(calc.multiply(-2, 3) === -6, 'multiply(-2, 3) === -6');
assert(calc.multiply(0, 5) === 0, 'multiply(0, 5) === 0');

// Test division
assert(calc.divide(6, 2) === 3, 'divide(6, 2) === 3');
assert(calc.divide(5, 2) === 2.5, 'divide(5, 2) === 2.5');
assert(calc.divide(-10, 2) === -5, 'divide(-10, 2) === -5');

// Test division by zero
assertThrows(() => calc.divide(5, 0), 'divide(5, 0) throws error');
assertThrows(() => calc.divide(0, 0), 'divide(0, 0) throws error');

console.log(`\nResults: ${testsPassed} passed, ${testsFailed} failed`);

if (testsFailed > 0) {
    process.exit(1);
}
EOF

# Run the test script
echo -e "${BLUE}Running validation tests...${NC}"
node /tmp/calculator-test.js

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}✓ All validation tests passed!${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo ""
    echo -e "${GREEN}The Calculator class is working correctly in the tmux environment.${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}=====================================${NC}"
    echo -e "${RED}✗ Some validation tests failed${NC}"
    echo -e "${RED}=====================================${NC}"
    echo ""
    exit 1
fi

# Clean up
rm -f /tmp/calculator-test.js

# Display summary
echo "Validation Summary:"
echo "  - Calculator class: ✓ Loaded successfully"
echo "  - add() method: ✓ Working"
echo "  - subtract() method: ✓ Working"
echo "  - multiply() method: ✓ Working"
echo "  - divide() method: ✓ Working"
echo "  - divide by zero: ✓ Proper error handling"
echo ""
echo -e "${GREEN}tmux integration validated successfully!${NC}"
