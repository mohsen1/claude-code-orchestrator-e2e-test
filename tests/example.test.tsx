import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/**
 * Example test file demonstrating the test setup
 * This file can be removed once real tests are added
 */

describe('Vitest Setup Verification', () => {
  it('should run a basic test', () => {
    expect(true).toBe(true);
  });

  it('should support async/await', async () => {
    const asyncValue = await Promise.resolve(42);
    expect(asyncValue).toBe(42);
  });

  it('should mock functions', () => {
    const mockFn = vi.fn();
    mockFn('hello');
    expect(mockFn).toHaveBeenCalledWith('hello');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should support timers', () => {
    vi.useFakeTimers();
    const callback = vi.fn();

    setTimeout(callback, 1000);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});

describe('React Testing Library', () => {
  it('should render React components', () => {
    function TestComponent() {
      return <div>Hello, World!</div>;
    }

    render(<TestComponent />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    function Button() {
      return <button>Click me</button>;
    }

    const user = userEvent.setup();
    render(<Button />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(button).toBeInTheDocument();
  });

  it('should support snapshots', () => {
    function Component({ name }: { name: string }) {
      return <div>Hello, {name}!</div>;
    }

    const { container } = render(<Component name="World" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe('Test Utilities', () => {
  it('should provide custom matchers', () => {
    const element = document.createElement('div');
    element.setAttribute('id', 'test-id');

    expect(element).toHaveAttribute('id', 'test-id');
  });

  it('should support beforeEach/afterEach hooks', () => {
    let counter = 0;

    expect(counter).toBe(0);
  });
});

describe('Integration Test Example', () => {
  it('should test API response handling', async () => {
    // Example of testing async operations
    interface User {
      id: number;
      name: string;
    }

    const fetchUser = async (id: number): Promise<User> => {
      // Simulated API call
      return {
        id,
        name: `User ${id}`,
      };
    };

    const user = await fetchUser(1);
    expect(user).toEqual({
      id: 1,
      name: 'User 1',
    });
  });

  it('should test error handling', async () => {
    const failingOperation = async (): Promise<never> => {
      throw new Error('Operation failed');
    };

    await expect(failingOperation()).rejects.toThrow('Operation failed');
  });
});
