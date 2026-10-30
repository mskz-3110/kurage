import { Time } from './time.js';

export class Stopwatch {
  static new(...args: ConstructorParameters<typeof Stopwatch>): Stopwatch {
    return new Stopwatch(...args);
  }

  #startTime: Time | undefined;

  get startTime(): Time | undefined {
    return this.#startTime;
  }

  #stopTime: Time | undefined;

  get stopTime(): Time | undefined {
    return this.#stopTime;
  }

  get duration(): number {
    const stopTime = this.#stopTime ?? Time.new();
    const startTime = this.#startTime ?? stopTime;
    return stopTime.since(startTime);
  }

  start() {
    this.#startTime = Time.new();
    this.#stopTime = undefined;
  }

  stop() {
    if (this.#stopTime == null) {
      this.#stopTime = Time.new();
    }
  }
}
