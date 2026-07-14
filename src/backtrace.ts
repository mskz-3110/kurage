import { Line } from './line.js';

export type Frame = NodeJS.CallSite;

export class Backtrace {
  static #prepareStackTrace = Error.prepareStackTrace;

  static normalizeOffset(offset: number): number {
    return 0 <= offset ? offset : 0;
  }

  static new(offset: number = 0, maxLength: number = 0): Backtrace {
    return new Backtrace(Backtrace.normalizeOffset(offset) + 1, maxLength);
  }

  frames: Frame[] = [];

  constructor(offset: number = 0, maxLength: number = 0) {
    try {
      Error.prepareStackTrace = (_, stackTraces) => {
        return stackTraces.slice(Backtrace.normalizeOffset(offset) + 1);
      };
      this.frames = new Error().stack as unknown as Frame[];
      if (0 < maxLength && maxLength < this.frames.length) {
        this.frames.length = maxLength;
      }
    } finally {
      Error.prepareStackTrace = Backtrace.#prepareStackTrace;
    }
  }

  toString(prefix: string = '  '): string {
    return Line.join(this.frames.map((frame) => `${prefix}${frame}`));
  }
}
