export declare class Color {
  #private;
  static $: Color;
  get names(): string[];
  get(name: string): string;
  set(name: string, value: string): void;
  paint(name: string, message: string): string;
}
