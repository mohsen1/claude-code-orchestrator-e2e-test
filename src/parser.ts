interface ParsedExpression {
  left: number;
  operator: 'add' | 'subtract' | 'multiply' | 'divide';
  right: number;
}

export function parseExpression(expression: string): ParsedExpression {
  const trimmed = expression.trim();

  if (!trimmed) {
    throw new Error('Empty expression');
  }

  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*([-+*\/])\s*(-?\d+(?:\.\d+)?)$/);

  if (!match) {
    throw new Error('Invalid expression format');
  }

  const [, num1Str, operatorSymbol, num2Str] = match;
  const num1 = parseFloat(num1Str);
  const num2 = parseFloat(num2Str);

  if (isNaN(num1) || isNaN(num2)) {
    throw new Error('Invalid numbers');
  }

  let operator: 'add' | 'subtract' | 'multiply' | 'divide';

  switch (operatorSymbol) {
    case '+':
      operator = 'add';
      break;
    case '-':
      operator = 'subtract';
      break;
    case '*':
      operator = 'multiply';
      break;
    case '/':
      operator = 'divide';
      break;
    default:
      throw new Error('Unsupported operator');
  }

  return {
    left: num1,
    operator,
    right: num2
  };
}