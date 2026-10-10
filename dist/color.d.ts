export declare class Color {
  #private;
  static get enabled(): boolean;
  static get names(): readonly string[];
  static get(name: string): string;
  static set(name: string, value: string): void;
  static paint(name: string, message: string, enabled?: boolean): string;
}
