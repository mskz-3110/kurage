import { Backtrace } from '../dist/backtrace.js';

describe('Backtrace', () => {
  it('normalizeOffset', () => {
    expect(Backtrace.normalizeOffset(-1)).toBe(0);
    expect(Backtrace.normalizeOffset(0)).toBe(0);
    expect(Backtrace.normalizeOffset(2)).toBe(2);
  });

  it('new', () => {
    expect(Array.isArray(Backtrace.new().frames)).toBe(true);
    expect(Backtrace.new(0, 1).frames.length).toBeLessThanOrEqual(1);
  });

  it('toString', () => {
    const backtrace = Backtrace.new();
    expect(backtrace.toString()).toBe(backtrace.frames.map((frame) => `  ${frame}`).join('\n'));
    expect(backtrace.toString('\t')).toBe(backtrace.frames.map((frame) => `\t${frame}`).join('\n'));
  });
});
