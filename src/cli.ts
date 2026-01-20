import { Calculator } from "./calculator";

const calculator = new Calculator();

function parseArguments(args: string[]): { operation: string; a: number; b: number } {
  if (args.length < 5) {
    console.error("Usage: npm run calc <operation> <number1> <number2>");
    console.error("Operations: add, subtract, multiply, divide");
    process.exit(1);
  }

  const operation = args[2];
  const a = parseFloat(args[3]);
  const b = parseFloat(args[4]);

  if (isNaN(a) || isNaN(b)) {
    console.error("Error: Both arguments must be valid numbers");
    process.exit(1);
  }

  return { operation, a, b };
}

function executeOperation(operation: string, a: number, b: number): number {
  switch (operation.toLowerCase()) {
    case "add":
      return calculator.add(a, b);
    case "subtract":
      return calculator.subtract(a, b);
    case "multiply":
      return calculator.multiply(a, b);
    case "divide":
      return calculator.divide(a, b);
    default:
      console.error(`Error: Unknown operation '${operation}'`);
      console.error("Available operations: add, subtract, multiply, divide");
      process.exit(1);
      throw new Error("Unreachable");
  }
}

function main() {
  const args = process.argv;
  const { operation, a, b } = parseArguments(args);

  try {
    const result = executeOperation(operation, a, b);
    console.log(result);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

main();
