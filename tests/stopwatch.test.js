import { Stopwatch } from '../dist/stopwatch.js';
import { Time } from '../dist/time.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Stopwatch', () => {
  it('new', () => {
    expect(Stopwatch.new() != null).toBe(true);
  });

  it('duration', () => {
    const startTime = {
      value: 1000,
      since(baseTime) {
        return this.value - baseTime.value;
      },
    };
    const stopTime = {
      value: 2500,
      since(baseTime) {
        return this.value - baseTime.value;
      },
    };
    vi.spyOn(Time, 'new').mockReturnValueOnce(startTime).mockReturnValueOnce(stopTime);
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
