import { Counter } from './types';
import { loadCounter, saveCounter } from './storage';

export function increment(): number {
  const counter = loadCounter();
  counter.value += 1;
  saveCounter(counter);
  return counter.value;
}

export function decrement(): number {
  const counter = loadCounter();
  counter.value -= 1;
  saveCounter(counter);
  return counter.value;
}

export function show(): number {
  const counter = loadCounter();
  return counter.value;
}

export function reset(): number {
  const counter: Counter = { value: 0 };
  saveCounter(counter);
  return counter.value;
}
