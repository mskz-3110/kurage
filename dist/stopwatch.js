import { Timestamp } from './timestamp.js';

var Stopwatch = class Stopwatch {
  static new(...args) {
    return new Stopwatch(...args);
  }
  #startTime;
  get startTime() {
    return this.#startTime;
  }
  #stopTime;
  get endTime() {
    return this.#stopTime;
  }
  get elapsedTime() {
    const stopTime = this.#stopTime ?? new Timestamp();
    const startTime = this.#startTime ?? stopTime;
    return (stopTime.date.getTime() - startTime.date.getTime()) / 1e3;
  }
  start() {
    this.#startTime = new Timestamp();
    this.#stopTime = void 0;
  }
  stop() {
    this.#stopTime = this.#stopTime ?? new Timestamp();
  }
};

export { Stopwatch };
