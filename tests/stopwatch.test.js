import { Stopwatch } from '../dist/stopwatch.js';
import { Time } from '../dist/time.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Stopwatch', () => {
  it('creates a stopwatch', () => {
    expect(Stopwatch.new()).toBeInstanceOf(Stopwatch);
  });

  it('measures elapsed time & resets when restarted', () => {
    const createTime = (value) => ({
      value,
      since(baseTime) {
        return this.value - baseTime.value;
      },
    });
    const startTime = createTime(1000);
    const stopTime = createTime(2500);
    const restartedAt = createTime(3000);
    const currentTime = createTime(3500);
    vi.spyOn(Time, 'new')
      .mockReturnValueOnce(startTime)
      .mockReturnValueOnce(stopTime)
      .mockReturnValueOnce(restartedAt)
      .mockReturnValueOnce(restartedAt)
      .mockReturnValueOnce(currentTime);
    const stopwatch = Stopwatch.new();
    stopwatch.start();
    stopwatch.stop();
    expect(stopwatch.startTime).toBe(startTime);
    expect(stopwatch.stopTime).toBe(stopTime);
    expect(stopwatch.duration).toBe(1500);
    stopwatch.stop();
    expect(stopwatch.duration).toBe(1500);
    stopwatch.start();
    expect(stopwatch.duration).toBe(0);
    expect(Stopwatch.new().duration).toBe(0);
  });
});
