import { Timestamp } from './timestamp.js';
export declare class Stopwatch {
  #private;
  static new(...args: ConstructorParameters<typeof Stopwatch>): Stopwatch;
  get startTime(): Timestamp | undefined;
  get endTime(): Timestamp | undefined;
  get duration(): number;
  start(): void;
  stop(): void;
}
