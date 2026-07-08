export type Frame = NodeJS.CallSite;

export class Backtrace {
  static #prepareStackTrace = Error.prepareStackTrace;

  static #normalizeOffset(offset: number): number {
    return 0 <= offset ? offset : 0;
  }

  static new(offset: number = 0): Backtrace {
    return new Backtrace(Backtrace.#normalizeOffset(offset) + 1);
  }

  #frames: Frame[] = [];

  get frames(): readonly Frame[] {
    return this.#frames;
  }

  constructor(offset: number = 0) {
    try {
      Error.prepareStackTrace = (_, stackTraces) => {
        return stackTraces.slice(Backtrace.#normalizeOffset(offset) + 1);
      };
      for (const frame of new Error().stack as unknown as Frame[]) {
        if (!frame.isNative()) {
          this.#frames.push(frame);
        }
      }
    } finally {
      Error.prepareStackTrace = Backtrace.#prepareStackTrace;
    }
  }

  toString(prefix: string = '  '): string {
    return this.#frames.map((frame) => `${prefix}${frame}`).join('\n');
  }
}
