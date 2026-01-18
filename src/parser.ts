export interface Expression {
  left: number;
  operator: 'add' | 'subtract' | 'multiply' | 'divide';
  right: number;
}

export function parseExpression(expression: string): Expression {
  const trimmed = expression.trim();

  if (!trimmed) {
    throw new Error('Empty expression');
  }

  // Regular expression to match the pattern: [optional minus][digits][optional decimal][digits] operator [same pattern for right side]
  const pattern = /^([-+]?\d*\.?\d+)\s*([-+*/])\s*([-+]?\d*\.?\d+)$/;
  const match = trimmed.match(pattern);

  if (!match) {
    throw new Error('Invalid expression format');
  }

  const leftStr = match[1];
  const operator = match[2];
  const rightStr = match[3];

  const left = parseFloat(leftStr);
  const right = parseFloat(rightStr);

  if (isNaN(left) || isNaN(right)) {
    throw new Error('Invalid number format');
  }

  let operatorType: 'add' | 'subtract' | 'multiply' | 'divide';
  switch (operator) {
    case '+':
      operatorType = 'add';
      break;
    case '-':
      operatorType = 'subtract';
      break;
    case '*':
      operatorType = 'multiply';
      break;
    case '/':
      operatorType = 'divide';
      break;
    default:
      throw new Error('Unsupported operator');
  }

  return {
    left,
    operator: operatorType,
    right,
  };
}