var Color = class Color {
  static #invalidNames = Object.getOwnPropertyNames(Color);
  static #colors = {};
  static get(name) {
    return Color.#colors[name];
  }
  static set(name, value) {
    if (Color.#invalidNames.includes(name)) return;
    if (!Object.hasOwn(Color.#colors, name))
      Object.defineProperty(Color, name, {
        get: () => Color.get(name),
        enumerable: true,
        configurable: true,
      });
    Color.#colors[name] = value;
  }
  static paint(name, message) {
    if (message === '') return message;
    const value = Color.get(name);
    if (value == null) return message;
    const reset = Color.get('reset');
    const paintedMessage = `${value}${message}`;
    return value === reset ? paintedMessage : `${paintedMessage}${reset}`;
  }
  static {
    Color.set('reset', '\x1B[0m');
    Color.set('red', '\x1B[31m');
    Color.set('green', '\x1B[32m');
    Color.set('yellow', '\x1B[33m');
    Color.set('blue', '\x1B[34m');
    Color.set('magenta', '\x1B[35m');
    Color.set('cyan', '\x1B[36m');
    Color.set('gray', '\x1B[90m');
  }
};

export { Color };
