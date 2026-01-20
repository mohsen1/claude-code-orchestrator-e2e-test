import * as fs from 'fs';
import * as path from 'path';
import { Counter } from './types';

const STORAGE_FILE = 'counter.json';

export function loadCounter(): Counter {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading counter:', error);
  }
  return { value: 0 };
}

export function saveCounter(counter: Counter): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(counter, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving counter:', error);
    throw error;
  }
}
