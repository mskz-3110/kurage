export class Color {
  static #colors: Record<string, string> = {
    reset: '\u001b[0m',
    red: '\u001b[31m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    blue: '\u001b[34m',
    magenta: '\u001b[35m',
    cyan: '\u001b[36m',
    gray: '\u001b[90m',
  };

  static #invalidNames: string[] = [
    ...Object.getOwnPropertyNames(Color),
    ...Object.getOwnPropertyNames(Color.prototype),
  ];

  static get enabled(): boolean {
    return typeof process.stdout.hasColors === 'function'
      ? process.stdout.hasColors()
      : false;
  }

  static get names(): readonly string[] {
    return Object.keys(Color.#colors);
  }

  static get(name: string): string {
    return Object.hasOwn(Color.#colors, name) ? Color.#colors[name]! : '';
  }

  static set(name: string, value: string) {
    if (Color.#invalidNames.includes(name) || name === '') {
      return;
    }

    Color.#colors[name] = value;
  }

  static paint(name: string, message: string, enabled: boolean = true): string {
    if (!enabled || !Color.enabled || message === '') {
      return message;
    }

    const value = Color.get(name);
    if (value === '') {
      return message;
    }

    const reset = Color.get('reset');
    return value === reset ? `${value}${message}` : `${value}${message}${reset}`;
  }
}
