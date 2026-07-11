export type Frame = NodeJS.CallSite;
export declare class Backtrace {
  #private;
  static normalizeOffset(offset: number): number;
  static new(offset?: number, maxLength?: number): Backtrace;
  frames: Frame[];
  constructor(offset?: number, maxLength?: number);
  toString(prefix?: string): string;
}
