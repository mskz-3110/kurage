import { Backtrace } from '../dist/backtrace.js';

describe('Backtrace', () => {
  it('normalizes negative offsets to zero', () => {
    expect(Backtrace.normalizeOffset(-1)).toBe(0);
    expect(Backtrace.normalizeOffset(0)).toBe(0);
    expect(Backtrace.normalizeOffset(2)).toBe(2);
  });

  it('creates a backtrace with an optional maximum length', () => {
    expect(Backtrace.new().frames).toEqual(expect.any(Array));
    expect(Backtrace.new(0, 1).frames.length).toBeLessThanOrEqual(1);
  });

  it('returns the calling frame', () => {
    function invokeCaller() {
      return Backtrace.caller();
    }

    expect(String(Backtrace.caller())).toContain('backtrace.test.js');
    expect(String(invokeCaller())).toContain('invokeCaller');
  });

  it('formats frames with the requested prefix', () => {
    const backtrace = Backtrace.new();
    expect(backtrace.toString()).toBe(backtrace.frames.map((frame) => `  ${frame}`).join('\n'));
    expect(backtrace.toString('\t')).toBe(backtrace.frames.map((frame) => `\t${frame}`).join('\n'));
  });
});
