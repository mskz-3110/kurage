var Color = class Color {
  static $ = Color.new();
  static get enabled() {
    return typeof process.stdout.hasColors === 'function'
      ? process.stdout.hasColors()
      : false;
  }
  static {
    Color.$.set('reset', '\x1B[0m');
    Color.$.set('red', '\x1B[31m');
    Color.$.set('green', '\x1B[32m');
    Color.$.set('yellow', '\x1B[33m');
    Color.$.set('blue', '\x1B[34m');
    Color.$.set('magenta', '\x1B[35m');
    Color.$.set('cyan', '\x1B[36m');
    Color.$.set('gray', '\x1B[90m');
  }
  static new(...args) {
    return new Color(...args);
  }
  #invalidNames = [
    ...Object.getOwnPropertyNames(Color),
    ...Object.getOwnPropertyNames(Color.prototype),
  ];
  #colors = {};
  get names() {
    return Object.keys(this.#colors);
  }
  get(name) {
    return this.#colors[name] ?? '';
  }
  set(name, value) {
    if (this.#invalidNames.includes(name) || name === '') return;
    this.#colors[name] = value;
  }
  paint(name, message, enabled = true) {
    if (!enabled || !Color.enabled || message === '') return message;
    const value = this.get(name);
    if (value === '') return message;
    const reset = this.get('reset');
    return value === reset ? `${value}${message}` : `${value}${message}${reset}`;
  }
};

export { Color };
