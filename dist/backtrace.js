var Backtrace = class Backtrace {
  static #prepareStackTrace = Error.prepareStackTrace;
  static #normalizeOffset(offset) {
    return 0 <= offset ? offset : 0;
  }
  static new(offset = 0) {
    return new Backtrace(Backtrace.#normalizeOffset(offset) + 1);
  }
  #frames = [];
  get frames() {
    return this.#frames;
  }
  constructor(offset = 0) {
    try {
      Error.prepareStackTrace = (_, stackTraces) => {
        return stackTraces.slice(Backtrace.#normalizeOffset(offset) + 1);
      };
      for (const frame of /* @__PURE__ */ new Error().stack)
        if (!frame.isNative()) this.#frames.push(frame);
    } finally {
      Error.prepareStackTrace = Backtrace.#prepareStackTrace;
    }
  }
  toString(prefix = '  ') {
    return this.#frames.map((frame) => `${prefix}${frame}`).join('\n');
  }
};

export { Backtrace };
