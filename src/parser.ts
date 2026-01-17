export type Operator = 'add' | 'subtract' | 'multiply' | 'divide';

export interface Expression {
  left: number;
  operator: Operator;
  right: number;
}

export function parseExpression(input: string): Expression {
  // Trim leading and trailing whitespace
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error('Invalid expression: empty string');
  }

  // Find the operator and split the expression
  // We need to handle negative numbers, so we look for operators not at the start
  const operators = [
    { symbol: '+', name: 'add' as Operator },
    { symbol: '-', name: 'subtract' as Operator },
    { symbol: '*', name: 'multiply' as Operator },
    { symbol: '/', name: 'divide' as Operator },
  ];

  let matchedOperator: Operator | null = null;
  let leftStr: string | null = null;
  let rightStr: string | null = null;

  // Try to find an operator (looking from left to right, but skip leading - for negative numbers)
  for (const op of operators) {
    // Find all occurrences of the operator
    let index = trimmed.indexOf(op.symbol);

    // For subtraction, we need to be careful about negative numbers
    // Skip if it's at position 0 (leading negative)
    if (op.symbol === '-' && index === 0) {
      // Look for the next occurrence
      index = trimmed.indexOf(op.symbol, 1);
    }

    // If we found an operator at a valid position
    while (index > 0) {
      leftStr = trimmed.substring(0, index).trim();
      rightStr = trimmed.substring(index + 1).trim();

      // Check if this is a valid split (both sides should parse as numbers)
      const leftNum = parseFloat(leftStr);
      const rightNum = parseFloat(rightStr);

      if (!isNaN(leftNum) && !isNaN(rightNum)) {
        // Validate that the strings only contain valid number characters
        const validPattern = /^-?\d+(\.\d+)?$/;
        if (validPattern.test(leftStr) && validPattern.test(rightStr)) {
          matchedOperator = op.name;
          break;
        }
      }

      // If subtraction, look for next occurrence
      if (op.symbol === '-') {
        const nextIndex = trimmed.indexOf(op.symbol, index + 1);
        if (nextIndex > index) {
          index = nextIndex;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (matchedOperator) {
      break;
    }
  }

  if (!matchedOperator || leftStr === null || rightStr === null) {
    throw new Error('Invalid expression: no valid operator found');
  }

  const left = parseFloat(leftStr);
  const right = parseFloat(rightStr);

  if (isNaN(left) || isNaN(right)) {
    throw new Error('Invalid expression: operands must be numbers');
  }

  return {
    left,
    operator: matchedOperator,
    right,
  };
}
