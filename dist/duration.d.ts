export type Unit = 'ms' | 's' | 'm' | 'h' | 'd';
export declare class Duration {
  #private;
  static parse(string: string): Duration;
  static new(...args: ConstructorParameters<typeof Duration>): Duration;
  get ms(): number;
  get amount(): number;
  get unit(): Unit;
  constructor(ms: number);
  toString(): string;
}
