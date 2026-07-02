export class Timestamp {
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

  static formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('ja-JP', Timestamp.#options);

  static new(...args: ConstructorParameters<typeof Timestamp>): Timestamp {
    return new Timestamp(...args);
  }

  #date: Date;

  get date() {
    return this.#date;
  }

  constructor(date: Date = new Date()) {
    this.#date = date;
  }

  toString(): string {
    return Timestamp.formatter.format(this.#date);
  }
}
