import { Time } from './time.js';
export declare class Stopwatch {
  #private;
  static new(...args: ConstructorParameters<typeof Stopwatch>): Stopwatch;
  get startTime(): Time | undefined;
  get stopTime(): Time | undefined;
  get duration(): number;
  start(): void;
  stop(): void;
}
