import { Timestamp } from './timestamp.js';

export class Stopwatch {
  static new(...args: ConstructorParameters<typeof Stopwatch>): Stopwatch {
    return new Stopwatch(...args);
  }

  #startTime: Timestamp | undefined;

  get startTime(): Timestamp | undefined {
    return this.#startTime;
  }

  #stopTime: Timestamp | undefined;

  get stopTime(): Timestamp | undefined {
    return this.#stopTime;
  }

  get duration(): number {
    const stopTime = this.#stopTime ?? new Timestamp();
    const startTime = this.#startTime ?? stopTime;
    return stopTime.date.getTime() - startTime.date.getTime();
  }

  start() {
    this.#startTime = new Timestamp();
    this.#stopTime = undefined;
  }

  stop() {
    if (this.#stopTime == null) {
      this.#stopTime = new Timestamp();
    }
  }
}
