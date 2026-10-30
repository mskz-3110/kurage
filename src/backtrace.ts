import { Line } from './line.js';

export type Frame = NodeJS.CallSite;

export class Backtrace {
  static readonly #prepareStackTrace = Error.prepareStackTrace;

  static normalizeOffset(offset: number): number {
    return 0 <= offset ? offset : 0;
  }

  static caller(offset: number = 0): Frame | undefined {
    return new Backtrace(Backtrace.normalizeOffset(offset) + 1, 1).frames[0];
  }

  static new(offset: number = 0, maxLength: number = 0): Backtrace {
    return new Backtrace(Backtrace.normalizeOffset(offset) + 1, maxLength);
  }

  readonly frames: Frame[];

  constructor(offset: number = 0, maxLength: number = 0) {
    try {
      Error.prepareStackTrace = (_, stackTraces) => {
        return stackTraces.slice(Backtrace.normalizeOffset(offset) + 1);
      };
      const frames = new Error().stack as unknown as Frame[];
      if (0 < maxLength && maxLength < frames.length) {
        frames.length = maxLength;
      }
      this.frames = frames;
    } finally {
      Error.prepareStackTrace = Backtrace.#prepareStackTrace;
    }
  }

  toString(prefix: string = '  '): string {
    return Line.join(this.frames.map((frame) => `${prefix}${frame}`));
  }
}
