var Color = class Color {
  static #colors = {
    reset: '\x1B[0m',
    red: '\x1B[31m',
    green: '\x1B[32m',
    yellow: '\x1B[33m',
    blue: '\x1B[34m',
    magenta: '\x1B[35m',
    cyan: '\x1B[36m',
    gray: '\x1B[90m',
  };
  static #invalidNames = [
    ...Object.getOwnPropertyNames(Color),
    ...Object.getOwnPropertyNames(Color.prototype),
  ];
  static get enabled() {
    return typeof process.stdout.hasColors === 'function'
      ? process.stdout.hasColors()
      : false;
  }
  static get names() {
    return Object.keys(Color.#colors);
  }
  static get(name) {
    return Color.#colors[name] ?? '';
  }
  static set(name, value) {
    if (Color.#invalidNames.includes(name) || name === '') return;
    Color.#colors[name] = value;
  }
  static paint(name, message, enabled = true) {
    if (!enabled || !Color.enabled || message === '') return message;
    const value = Color.get(name);
    if (value === '') return message;
    const reset = Color.get('reset');
    return value === reset ? `${value}${message}` : `${value}${message}${reset}`;
  }
};

export { Color };
