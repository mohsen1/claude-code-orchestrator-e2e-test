/**
 * Counter business logic implementation
 */

export interface Counter {
  value: number;
}

export class CounterService {
  private counter: Counter;

  constructor(initialValue: number = 0) {
    this.counter = { value: initialValue };
  }

  /**
   * Increment counter by 1
   */
  increment(): Counter {
    this.counter.value += 1;
    return this.getCounter();
  }

  /**
   * Decrement counter by 1
   */
  decrement(): Counter {
    this.counter.value -= 1;
    return this.getCounter();
  }

  /**
   * Get current counter value
   */
  show(): Counter {
    return this.getCounter();
  }

  /**
   * Reset counter to 0
   */
  reset(): Counter {
    this.counter.value = 0;
    return this.getCounter();
  }

  /**
   * Get counter object
   */
  private getCounter(): Counter {
    return { ...this.counter };
  }

  /**
   * Set counter value (used for loading from storage)
   */
  setValue(value: number): Counter {
    this.counter.value = value;
    return this.getCounter();
  }
}
