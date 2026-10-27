import { Line } from './line.js';

var Backtrace = class Backtrace {
  static #prepareStackTrace = Error.prepareStackTrace;
  static normalizeOffset(offset) {
    return 0 <= offset ? offset : 0;
  }
  static caller(offset = 0) {
    return new Backtrace(Backtrace.normalizeOffset(offset) + 1, 1).frames[0];
  }
  static new(offset = 0, maxLength = 0) {
    return new Backtrace(Backtrace.normalizeOffset(offset) + 1, maxLength);
  }
  frames;
  constructor(offset = 0, maxLength = 0) {
    try {
      Error.prepareStackTrace = (_, stackTraces) => {
        return stackTraces.slice(Backtrace.normalizeOffset(offset) + 1);
      };
      const frames = /* @__PURE__ */ new Error().stack;
      if (0 < maxLength && maxLength < frames.length) frames.length = maxLength;
      this.frames = frames;
    } finally {
      Error.prepareStackTrace = Backtrace.#prepareStackTrace;
    }
  }
  toString(prefix = '  ') {
    return Line.join(this.frames.map((frame) => `${prefix}${frame}`));
  }
};

export { Backtrace };
