import * as fs from 'fs';
import * as path from 'path';

const COUNTER_FILE = 'counter.json';

export interface CounterData {
  value: number;
}

/**
 * Read the counter value from counter.json
 * @returns The counter data with current value
 */
export function readCounter(): CounterData {
  const filePath = path.resolve(process.cwd(), COUNTER_FILE);

  if (!fs.existsSync(filePath)) {
    // If file doesn't exist, return initial value
    return { value: 0 };
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    return data;
  } catch (error) {
    // If there's an error reading/parsing, return initial value
    return { value: 0 };
  }
}

/**
 * Write the counter value to counter.json
 * @param data The counter data to write
 */
export function writeCounter(data: CounterData): void {
  const filePath = path.resolve(process.cwd(), COUNTER_FILE);

  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write counter to file: ${error}`);
  }
}
