export interface Expression {
  left: number;
  operator: 'add' | 'subtract' | 'multiply' | 'divide';
  right: number;
}

export function parseExpression(expression: string): Expression {
  const trimmedExpression = expression.trim();

  if (!trimmedExpression) {
    throw new Error('Empty expression');
  }

  // Use a more sophisticated regex that accounts for negative numbers
  const regex = /^([+-]?\d*\.?\d+)\s*([+\-*/])\s*([+-]?\d*\.?\d+)$/;
  const match = trimmedExpression.match(regex);

  if (!match) {
    throw new Error('Invalid expression format');
  }

  const leftStr = match[1].trim();
  const operatorStr = match[2].trim();
  const rightStr = match[3].trim();

  const left = parseFloat(leftStr);
  const right = parseFloat(rightStr);

  if (isNaN(left) || isNaN(right)) {
    throw new Error('Invalid numeric operand');
  }

  let operator: Expression['operator'];
  switch (operatorStr) {
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
    left,
    operator,
    right,
  };
}