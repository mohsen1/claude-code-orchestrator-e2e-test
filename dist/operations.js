export function performOperation(left, operator, right) {
    switch (operator) {
        case 'add':
            return add(left, right);
        case 'subtract':
            return subtract(left, right);
        case 'multiply':
            return multiply(left, right);
        case 'divide':
            return divide(left, right);
        default:
            throw new Error(`Unknown operator: ${operator}`);
    }
}
export function add(a, b) {
    return a + b;
}
export function subtract(a, b) {
    return a - b;
}
export function multiply(a, b) {
    return a * b;
}
export function divide(a, b) {
    if (b === 0) {
        throw new Error('Division by zero');
    }
    return a / b;
}
