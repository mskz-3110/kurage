import { afterEach, expect, it, vi } from 'vitest';
import { Time } from '../dist/time.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Time', () => {
  it('formatter', () => {
    expect(Time.formatter != null).toBe(true);
  });

  it('driftThreshold', () => {
    const value = Time.driftThreshold;

    Time.driftThreshold = 123;
    expect(Time.driftThreshold).toBe(123);

    Time.driftThreshold = -1;
    expect(Time.driftThreshold).toBe(123);

    const dateNow = vi.spyOn(Date, 'now').mockReturnValue(1000);
    const performanceNow = vi.spyOn(performance, 'now').mockReturnValue(2000);
    Time.driftThreshold = 0;
    expect(Time.now()).toBe(1000);
    expect(dateNow).toHaveBeenCalled();
    expect(performanceNow).toHaveBeenCalled();

    Time.driftThreshold = value;
  });

  it('now', () => {
    const value = Time.now();
    expect(typeof value).toBe('number');
    expect(Number.isFinite(value)).toBe(true);
  });

  it('new', () => {
    expect(Time.new().date instanceof Date).toBe(true);
  });

  it('since', () => {
    const baseTime = Time.new();
    expect(Time.new().since(baseTime)).toBeGreaterThanOrEqual(0);
  });

  it('toString', () => {
    const time = Time.new();
    expect(time.toString()).toBe(Time.formatter.format(time.date));
    const formatter = new Intl.DateTimeFormat('en-US');
    expect(time.toString(formatter)).toBe(formatter.format(time.date));
  });
});
