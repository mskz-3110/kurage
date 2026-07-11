export type Frame = NodeJS.CallSite;
export declare class Backtrace {
  #private;
  static new(offset?: number, maxLength?: number): Backtrace;
  frames: Frame[];
  constructor(offset?: number, maxLength?: number);
  toString(prefix?: string): string;
}
