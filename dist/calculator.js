import { parseExpression } from './parser.js';
import { performOperation } from './operations.js';
export function calculate(expression) {
    const parsed = parseExpression(expression);
    const result = performOperation(parsed.left, parsed.operator, parsed.right);
    return result;
}
