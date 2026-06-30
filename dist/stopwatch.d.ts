import { Timestamp } from './timestamp.js';
export declare class Stopwatch {
  #private;
  static new(...args: ConstructorParameters<typeof Stopwatch>): Stopwatch;
  get startTime(): Timestamp | undefined;
  get endTime(): Timestamp | undefined;
  get elapsedTime(): number;
  start(): void;
  stop(): void;
}
