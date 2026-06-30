var Timestamp = class Timestamp {
  static #options = {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  };
  static #formatter = new Intl.DateTimeFormat(void 0, Timestamp.#options);
  static new(...args) {
    return new Timestamp(...args);
  }
  #date;
  get date() {
    return this.#date;
  }
  constructor(value = /* @__PURE__ */ new Date()) {
    if (value instanceof Timestamp) this.#date = value.date;
    else if (value instanceof Date) this.#date = value;
    else this.#date = new Date(value);
  }
  toString() {
    return Timestamp.#formatter.format(this.#date);
  }
};

export { Timestamp };
