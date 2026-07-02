var Timestamp = class Timestamp {
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
  static formatter = new Intl.DateTimeFormat('ja-JP', Timestamp.#options);
  static new(...args) {
    return new Timestamp(...args);
  }
  #date;
  get date() {
    return this.#date;
  }
  constructor(date = /* @__PURE__ */ new Date()) {
    this.#date = date;
  }
  toString() {
    return Timestamp.formatter.format(this.#date);
  }
};

export { Timestamp };
