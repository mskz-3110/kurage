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
  get stopTime() {
    return this.#stopTime;
  }
  get duration() {
    const stopTime = this.#stopTime ?? new Timestamp();
    const startTime = this.#startTime ?? stopTime;
    return stopTime.date.getTime() - startTime.date.getTime();
  }
  start() {
    this.#startTime = new Timestamp();
    this.#stopTime = void 0;
  }
  stop() {
    if (this.#stopTime == null) this.#stopTime = new Timestamp();
  }
};

export { Stopwatch };
