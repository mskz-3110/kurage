export class Color {
  static $: Color = new Color();

  static get enabled(): boolean {return process.stdout.hasColors();}

  static {
    Color.$.set('reset', '\u001b[0m');
    Color.$.set('red', '\u001b[31m');
    Color.$.set('green', '\u001b[32m');
    Color.$.set('yellow', '\u001b[33m');
    Color.$.set('blue', '\u001b[34m');
    Color.$.set('magenta', '\u001b[35m');
    Color.$.set('cyan', '\u001b[36m');
    Color.$.set('gray', '\u001b[90m');
  }

  #invalidNames: string[] = [
    ...Object.getOwnPropertyNames(Color),
    ...Object.getOwnPropertyNames(Color.prototype),
  ];

  #colors: Record<string, string> = {};

  get names(): readonly string[] {
    return Object.keys(this.#colors);
  }

  get(name: string): string {
    if (!Color.enabled) {
      return '';
    }

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
