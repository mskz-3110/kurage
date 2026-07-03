export class Color {
  static color: Color = new Color();

  static {
    Color.color.set('reset', '\u001b[0m');
    Color.color.set('red', '\u001b[31m');
    Color.color.set('green', '\u001b[32m');
    Color.color.set('yellow', '\u001b[33m');
    Color.color.set('blue', '\u001b[34m');
    Color.color.set('magenta', '\u001b[35m');
    Color.color.set('cyan', '\u001b[36m');
    Color.color.set('gray', '\u001b[90m');
  }

  #invalidNames: string[] = [...Object.getOwnPropertyNames(Color), ...Object.getOwnPropertyNames(Color.prototype)];

  #colors: Record<string, string> = {};

  get names(): string[] {
    return Object.keys(this.#colors);
  }

  get(name: string): string {
    return this.#colors[name] ?? '';
  }

  set(name: string, value: string) {
    if (this.#invalidNames.includes(name) || name === '') {
      return;
    }

    this.#colors[name] = value;
  }

  paint(name: string, message: string): string {
    if (message === '') {
      return message;
    }

    const value = this.get(name);
    if (value === '') {
      return message;
    }

    const reset = this.get('reset');
    return value === reset ? `${value}${message}` : `${value}${message}${reset}`;
  }
}
