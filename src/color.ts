export class Color {
  static #invalidNames: string[] = Object.getOwnPropertyNames(Color);

  static #colors: Record<string, string> = {};

  static get(name: string): string | undefined {
    return Color.#colors[name];
  }

  static set(name: string, value: string) {
    if (Color.#invalidNames.includes(name)) {
      return;
    }

    if (!Object.hasOwn(Color.#colors, name)) {
      Object.defineProperty(Color, name, {
        get: () => Color.get(name),
        enumerable: true,
        configurable: true,
      });
    }

    Color.#colors[name] = value;
  }

  static paint(name: string, message: string): string {
    if (message === '') {
      return message;
    }

    const value = Color.get(name);
    if (value == null) {
      return message;
    }

    const reset = Color.get('reset');
    const paintedMessage = `${value}${message}`;
    return value === reset ? paintedMessage : `${paintedMessage}${reset}`;
  }

  static {
    Color.set('reset', '\u001b[0m');
    Color.set('red', '\u001b[31m');
    Color.set('green', '\u001b[32m');
    Color.set('yellow', '\u001b[33m');
    Color.set('blue', '\u001b[34m');
    Color.set('magenta', '\u001b[35m');
    Color.set('cyan', '\u001b[36m');
    Color.set('gray', '\u001b[90m');
  }
}
