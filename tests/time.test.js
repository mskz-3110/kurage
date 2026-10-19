import { afterEach, expect, it, vi } from 'vitest';
import { Time } from '../dist/time.js';

const driftThreshold = Time.driftThreshold;

afterEach(() => {
  vi.restoreAllMocks();
  Time.driftThreshold = 0;
  Time.now();
  Time.driftThreshold = driftThreshold;
  vi.unstubAllEnvs();
  Time.updateOffsetTime();
});

describe('Time', () => {
  it('exposes a date formatter', () => {
    expect(Time.formatter).toBeDefined();
  });

  it('accepts nonnegative drift thresholds & refreshes its time base', () => {
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
  });

  it('returns the current time as a finite number', () => {
    const value = Time.now();
    expect(typeof value).toBe('number');
    expect(Number.isFinite(value)).toBe(true);
  });

  it('applies KURAGE_BASE_TIME as an offset from the current time', () => {
    const baseTime = '2020-01-02T03:04:05.000Z';
    const expectedOffset = Date.parse(baseTime) - Date.now();
    vi.stubEnv('KURAGE_BASE_TIME', baseTime);
    Time.updateOffsetTime();

    expect(Math.abs(Time.now() - Date.now() - expectedOffset)).toBeLessThan(100);
  });

  it('creates a Time from the current instant', () => {
    expect(Time.new().date).toBeInstanceOf(Date);
  });

  it('calculates elapsed milliseconds since another Time', () => {
    const baseTime = Time.new();
    expect(Time.new().since(baseTime)).toBeGreaterThanOrEqual(0);
  });

  it('formats the date with the default or a supplied formatter', () => {
    const time = Time.new();
    expect(time.toString()).toBe(Time.formatter.format(time.date));
    const formatter = new Intl.DateTimeFormat('en-US');
    expect(time.toString(formatter)).toBe(formatter.format(time.date));
  });
});
