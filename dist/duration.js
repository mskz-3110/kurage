var Duration = class Duration {
  static #timeScales = [
    {
      threshold: 1e3 * 60 * 60 * 24,
      unit: 'd',
    },
    {
      threshold: 1e3 * 60 * 60,
      unit: 'h',
    },
    {
      threshold: 1e3 * 60,
      unit: 'm',
    },
    {
      threshold: 1e3,
      unit: 's',
    },
    {
      threshold: 0,
      unit: 'ms',
    },
  ];
  static #formatter = new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 3 });
  static new(...args) {
    return new Duration(...args);
  }
  #ms;
  get ms() {
    return this.#ms;
  }
  #amount = 0;
  get amount() {
    return this.#amount;
  }
  #unit = 'ms';
  get unit() {
    return this.#unit;
  }
  constructor(ms) {
    this.#ms = ms;
    for (const timeScale of Duration.#timeScales)
      if (timeScale.threshold <= ms) {
        this.#amount = 0 < timeScale.threshold ? ms / timeScale.threshold : ms;
        this.#unit = timeScale.unit;
        break;
      }
  }
  toString() {
    return `${Duration.#formatter.format(this.amount)}${this.#unit}`;
  }
};

export { Duration };
