import { Exception } from '../dist/exception.js';

describe('Exception', () => {
  it('copies an Error & preserves an undefined stack', () => {
    const error = new Error('error');
    error.stack = undefined;
    const exception = Exception.new(error);
    expect(exception.error.message).toBe('error');
    expect(exception.error).not.toBe(error);
    expect(exception.error.stack).toBe(undefined);
  });

  it('copies an Exception without sharing its Error', () => {
    const exception1 = Exception.new(new Error('exception1'));
    exception1.error.stack = undefined;
    const exception2 = Exception.new(exception1);
    exception2.error.message = 'exception2';
    expect(exception1.error.message).toBe('exception1');
    expect(exception2.error.message).toBe('exception2');
    expect(exception2.error.stack).toBe(undefined);
  });

  it('converts a string to an Error message', () => {
    [
      ['error'],
    ].forEach(([message]) => {
      expect(Exception.new(message).error.message).toBe(message);
    });
  });

  it('returns the stack or falls back to the message', () => {
    const exception = Exception.new(new Error('error'));
    expect(exception.toString()).toBe(exception.error.stack ?? exception.error.message);
    exception.error.stack = undefined;
    expect(exception.toString()).toBe('error');
  });
});
