import { Exception } from '../dist/exception.js';

describe('Exception', () => {
  it('new(Error)', () => {
    const error = new Error('error');
    error.stack = undefined;
    const exception = Exception.new(error);
    expect(exception.error.message).toBe('error');
    expect(exception.error).not.toBe(error);
    expect(exception.error.stack).toBe('');
  });

  it('new(Exception)', () => {
    const exception1 = Exception.new(new Error('exception1'));
    exception1.error.stack = undefined;
    const exception2 = Exception.new(exception1);
    exception2.error.message = 'exception2';
    expect(exception1.error.message).toBe('exception1');
    expect(exception2.error.message).toBe('exception2');
    expect(exception2.error.stack).toBe('');
  });

  it('new(string)', () => {
    [
      ['error'],
    ].forEach(([message]) => {
      expect(Exception.new(message).error.message).toBe(message);
    });
  });

  it('toString', () => {
    const exception = Exception.new(new Error('error'));
    expect(exception.toString()).toBe(exception.error.stack ?? exception.error.message);
    exception.error.stack = undefined;
    expect(exception.toString()).toBe('error');
  });
});
