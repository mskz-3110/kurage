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

  constructor(value: Timestamp | Date | string = new Date()) {
    if (value instanceof Timestamp) {
      this.#date = value.date;
    } else if (value instanceof Date) {
      this.#date = value;
    } else {
      this.#date = new Date(value);
    }
  }

  toString(): string {
    return Timestamp.formatter.format(this.#date);
  }
}
