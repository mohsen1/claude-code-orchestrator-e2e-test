export function parseExpression(input) {
    const trimmed = input.trim();
    // Match pattern: number operator number
    const match = trimmed.match(/^(-?\d+\.?\d*)\s*([+\-*/])\s*(-?\d+\.?\d*)$/);
    if (!match) {
        throw new Error(`Invalid expression: "${input}"`);
    }
    const [, leftStr, operatorStr, rightStr] = match;
    const left = parseFloat(leftStr);
    const right = parseFloat(rightStr);
    if (isNaN(left) || isNaN(right)) {
        throw new Error(`Invalid numbers in expression: "${input}"`);
    }
    const operator = operatorStr === '+' ? 'add'
        : operatorStr === '-' ? 'subtract'
            : operatorStr === '*' ? 'multiply'
                : operatorStr === '/' ? 'divide'
                    : null;
    if (!operator) {
        throw new Error(`Unknown operator: "${operatorStr}"`);
    }
    return {
        left,
        operator: operator,
        right,
    };
}
