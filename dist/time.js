var Time = class Time {
  static #options = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    fractionalSecondDigits: 3,
  };
  static #formatter = new Intl.DateTimeFormat('ja-JP', Time.#options);
  static get formatter() {
    return Time.#formatter;
  }
  static #driftThreshold = 100;
  static get driftThreshold() {
    return Time.#driftThreshold;
  }
  static set driftThreshold(value) {
    if (0 <= value) Time.#driftThreshold = value;
  }
  static #baseRealTime = Date.now();
  static #baseMonotonicTime = performance.now();
  static now() {
    const realTime = Date.now();
    const monotonicTime = performance.now();
    if (
      Time.#driftThreshold <=
      Math.abs(realTime - Time.#baseRealTime - (monotonicTime - Time.#baseMonotonicTime))
    ) {
      Time.#baseRealTime = realTime;
      Time.#baseMonotonicTime = monotonicTime;
    }
    return Time.#baseRealTime + monotonicTime - Time.#baseMonotonicTime;
  }
  static new(...args) {
    return new Time(...args);
  }
  #date;
  get date() {
    return this.#date;
  }
  constructor() {
    this.#date = new Date(Time.now());
  }
  since(baseTime) {
    return this.date.getTime() - baseTime.date.getTime();
  }
  toString(formatter = Time.formatter) {
    return formatter.format(this.#date);
  }
};

export { Time };
