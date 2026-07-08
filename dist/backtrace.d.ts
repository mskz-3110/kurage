export type Frame = NodeJS.CallSite;
export declare class Backtrace {
  #private;
  static new(offset?: number): Backtrace;
  get frames(): readonly Frame[];
  constructor(offset?: number);
  toString(prefix?: string): string;
}
