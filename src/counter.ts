export interface CounterState {
  value: number;
}

export class Counter {
  private state: CounterState;

  constructor(initialValue: number = 0) {
    this.state = { value: initialValue };
  }

  increment(): CounterState {
    this.state.value += 1;
    return this.getState();
  }

  decrement(): CounterState {
    this.state.value -= 1;
    return this.getState();
  }

  reset(): CounterState {
    this.state.value = 0;
    return this.getState();
  }

  show(): CounterState {
    return this.getState();
  }

  getState(): CounterState {
    return { ...this.state };
  }

  setState(state: CounterState): void {
    this.state = { ...state };
  }
}
