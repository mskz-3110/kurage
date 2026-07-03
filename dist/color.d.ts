export declare class Color {
  #private;
  static color: Color;
  get names(): string[];
  get(name: string): string;
  set(name: string, value: string): void;
  paint(name: string, message: string): string;
}
