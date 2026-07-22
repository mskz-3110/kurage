export class Time {
  static #options: Intl.DateTimeFormatOptions = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    fractionalSecondDigits: 3,
  };

  static formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('ja-JP', Time.#options);

  static #driftThreshold: number = 100;

  static get driftThreshold(): number {
    return Time.#driftThreshold;
  }

  static set driftThreshold(value: number) {
    if (0 <= value) {
      Time.#driftThreshold = value;
    }
  }

  static #baseRealTime: number = Date.now();

  static #baseMonotonicTime: number = performance.now();

  static now(): number {
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

  static new(...args: ConstructorParameters<typeof Time>): Time {
    return new Time(...args);
  }

  #date: Date;

  get date(): Date {
    return this.#date;
  }

  constructor() {
    this.#date = new Date(Time.now());
  }

  since(baseTime: Time): number {
    return this.date.getTime() - baseTime.date.getTime();
  }

  toString(): string {
    return Time.formatter.format(this.#date);
  }
}
