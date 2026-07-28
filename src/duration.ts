export type Unit = 'ms' | 's' | 'm' | 'h' | 'd';

type TimeScale = {
  threshold: number;
  unit: Unit;
};

export class Duration {
  static #timeScales: TimeScale[] = [
    { threshold: 1000 * 60 * 60 * 24, unit: 'd' },
    { threshold: 1000 * 60 * 60, unit: 'h' },
    { threshold: 1000 * 60, unit: 'm' },
    { threshold: 1000, unit: 's' },
    { threshold: 0, unit: 'ms' },
  ];

  static #formatter = new Intl.NumberFormat('ja-JP', {
    maximumFractionDigits: 3,
  });

  static #parseRegex: RegExp = /^(\d+(?:\.\d+)?)\s*([a-z]*)$/i;

  static parse(string: string): Duration {
    const match = string.match(Duration.#parseRegex);
    if (match == null) {
      throw new Error(`Invalid string: ${string}`);
    }

    const amount = parseFloat(match[1]!);
    const unit = match[2]!.toLowerCase();
    if (unit === '' || unit === 'ms') {
      return Duration.new(Math.round(amount));
    }

    for (const timeScale of Duration.#timeScales) {
      if (timeScale.unit === unit) {
        return Duration.new(Math.round(amount * timeScale.threshold));
      }
    }

    throw new Error(`Invalid unit: ${unit}`);
  }

  static new(...args: ConstructorParameters<typeof Duration>): Duration {
    return new Duration(...args);
  }

  #ms: number;

  get ms(): number {
    return this.#ms;
  }

  #amount: number = 0;

  get amount(): number {
    return this.#amount;
  }

  #unit: Unit = 'ms';

  get unit(): Unit {
    return this.#unit;
  }

  constructor(ms: number) {
    this.#ms = ms;

    for (const timeScale of Duration.#timeScales) {
      if (timeScale.threshold <= ms) {
        this.#amount = 0 < timeScale.threshold ? ms / timeScale.threshold : ms;
        this.#unit = timeScale.unit;
        break;
      }
    }
  }

  toString(): string {
    return `${Duration.#formatter.format(this.amount)}${this.#unit}`;
  }
}
