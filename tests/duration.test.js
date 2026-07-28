import { Duration } from '../dist/duration.js';

describe('Duration', () => {
  it('parse & toString', () => {
    [
      ['123ms', 123],
      ['1.5s', 1500],
      ['2m', 2 * 60 * 1000],
      ['3h', 3 * 60 * 60 * 1000],
      ['4d', 4 * 24 * 60 * 60 * 1000],
    ].forEach(([string, ms]) => {
      const duration = Duration.parse(string);
      expect(duration.ms).toBe(ms);
      expect(duration.toString()).toBe(string);
    });

    expect(() => Duration.parse('abc')).toThrow('Invalid string: abc');
    expect(() => Duration.parse('10xs')).toThrow('Invalid unit: xs');
  });

  it('new', () => {
    const duration = Duration.new(1500);
    expect(duration.ms).toBe(1500);
    expect(duration.amount).toBe(1.5);
    expect(duration.unit).toBe('s');
  });
});
