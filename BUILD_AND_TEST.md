# Build and Validation Scripts

This document describes the build and validation scripts for the Calculator TypeScript project, designed for testing tmux-based Claude runner integration.

## Available Scripts

### NPM Scripts

- **`npm run build`** - Compiles TypeScript to JavaScript
- **`npm run build:prod`** - Compiles with production config
- **`npm run clean`** - Removes the dist directory
- **`npm run test`** - Runs validation tests (alias for validate)
- **`npm run validate`** - Runs validation tests
- **`npm run build-and-test`** - Runs build then validation

### Shell Scripts

#### `build.sh`
Comprehensive build script that:
1. Cleans previous build artifacts
2. Installs dependencies if needed
3. Compiles TypeScript
4. Verifies build output exists
5. Validates JavaScript syntax
6. Displays build summary

Usage:
```bash
./build.sh
```

#### `validate.sh`
Validation script that tests the Calculator class:
- Loads the compiled JavaScript module
- Tests all Calculator methods (add, subtract, multiply, divide)
- Validates divide-by-zero error handling
- Reports test results with colored output

Usage:
```bash
./validate.sh
# or
npm run test
# or
npm run validate
```

## Build Output

The build process generates the following files in the `dist/` directory:

- `calculator.js` - Compiled JavaScript (CommonJS module)
- `calculator.d.ts` - TypeScript declaration file
- `calculator.js.map` - Source map for debugging
- `calculator.d.ts.map` - Source map for declarations

## TypeScript Compilation

The project uses TypeScript 5.3+ with strict type checking enabled:
- Target: ES2020
- Module system: CommonJS
- Strict mode enabled
- Source maps generated
- Declaration files generated

## Validation Tests

The validation script tests:
- ✓ Addition with positive, negative, and zero values
- ✓ Subtraction with various combinations
- ✓ Multiplication including negative and zero values
- ✓ Division including decimal results
- ✓ Division by zero error handling

All tests must pass for the tmux integration to be considered working correctly.

## Quick Start

```bash
# Build and test everything
npm run build-and-test

# Or run scripts individually
./build.sh
./validate.sh
```

## Troubleshooting

If you encounter issues:

1. **Module not found errors**: Ensure you've run `npm install`
2. **Permission denied**: Run `chmod +x build.sh validate.sh`
3. **TypeScript errors**: Check that `node_modules` is installed and TypeScript version is compatible
4. **Build failures**: Run `npm run clean` then `npm run build` again

## tmux Integration

These scripts are designed to validate that the Calculator class works correctly in a tmux environment, which is the primary use case for this project. The build and validation process should complete successfully when run within a tmux session.
