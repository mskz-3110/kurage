import { Time } from './time.js';

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
    const stopTime = this.#stopTime ?? Time.new();
    const startTime = this.#startTime ?? stopTime;
    return stopTime.since(startTime);
  }
  start() {
    this.#startTime = Time.new();
    this.#stopTime = void 0;
  }
  stop() {
    if (this.#stopTime == null) this.#stopTime = Time.new();
  }
};

export { Stopwatch };
