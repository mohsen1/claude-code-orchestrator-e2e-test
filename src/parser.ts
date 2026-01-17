export interface ParsedExpression {
  left: number;
  operator: 'add' | 'subtract' | 'multiply' | 'divide';
  right: number;
}

export function parseExpression(expression: string): ParsedExpression {
  // Remove leading and trailing whitespace
  const trimmed = expression.trim();

  if (!trimmed) {
    throw new Error('Empty expression');
  }

  // Map of operator symbols to operator names
  const operatorMap: { [key: string]: 'add' | 'subtract' | 'multiply' | 'divide' } = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide',
  };

  // Try to find operator (searching from left to right, skipping the first character)
  // We need to be careful with '-' as it can be both a minus operator and a negative sign
  let operatorIndex = -1;
  let operatorSymbol = '';

  // Search for operators, starting from position 1 (skip first char for negative numbers)
  // Priority: +, -, *, / (we'll find the first one we encounter from left to right, skipping negatives)
  for (let i = 1; i < trimmed.length; i++) {
    const char = trimmed[i];

    if (char === '+' || char === '*' || char === '/') {
      operatorIndex = i;
      operatorSymbol = char;
      break;
    } else if (char === '-') {
      // Check if this '-' is a subtraction operator or a negative sign
      // It's a subtraction operator if:
      // 1. The previous character is a digit, dot, or space (after a number)
      // 2. It's not immediately after another operator
      const prevChar = trimmed[i - 1];
      if (prevChar && (
        (prevChar >= '0' && prevChar <= '9') ||
        prevChar === '.' ||
        prevChar === ' '
      )) {
        // Check if previous non-space char is a number or dot
        let j = i - 1;
        while (j >= 0 && trimmed[j] === ' ') {
          j--;
        }
        if (j >= 0 && ((trimmed[j] >= '0' && trimmed[j] <= '9') || trimmed[j] === '.')) {
          operatorIndex = i;
          operatorSymbol = '-';
          break;
        }
      }
    }
  }

  if (operatorIndex === -1 || !operatorSymbol) {
    throw new Error('No valid operator found');
  }

  const operator = operatorMap[operatorSymbol];
  if (!operator) {
    throw new Error(`Unsupported operator: ${operatorSymbol}`);
  }

  // Split the expression at the operator
  const leftStr = trimmed.substring(0, operatorIndex).trim();
  const rightStr = trimmed.substring(operatorIndex + 1).trim();

  if (!leftStr || !rightStr) {
    throw new Error('Missing operand');
  }

  // Parse the numbers
  const left = parseFloat(leftStr);
  const right = parseFloat(rightStr);

  // Check if the parsing was successful
  if (isNaN(left) || isNaN(right)) {
    throw new Error('Invalid operand: not a number');
  }

  // Validate that the strings only contain valid number characters (including optional negative sign)
  const validNumberRegex = /^-?\d+(\.\d+)?$/;
  if (!validNumberRegex.test(leftStr) || !validNumberRegex.test(rightStr)) {
    throw new Error('Invalid characters in expression');
  }

  // Check for multiple operators by counting operators in the original string
  // We need to exclude the operator we found and any negative signs at the start of numbers
  let operatorCount = 0;
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (char === '+' || char === '*' || char === '/') {
      operatorCount++;
    } else if (char === '-') {
      // Count as operator only if it's not at the start and not after an operator/whitespace-operator sequence
      if (i > 0) {
        let j = i - 1;
        while (j >= 0 && trimmed[j] === ' ') {
          j--;
        }
        if (j >= 0 && ((trimmed[j] >= '0' && trimmed[j] <= '9') || trimmed[j] === '.')) {
          operatorCount++;
        }
      }
    }
  }

  if (operatorCount > 1) {
    throw new Error('Multiple operators not supported');
  }

  return {
    left,
    operator,
    right,
  };
}
