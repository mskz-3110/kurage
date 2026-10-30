var Exception = class Exception {
  static new(...args) {
    return new Exception(...args);
  }
  error;
  constructor(error) {
    if (error instanceof Exception) this.#setError(error.error);
    else if (error instanceof Error) this.#setError(error);
    else this.error = new Error(String(error));
  }
  #setError(error) {
    this.error = new Error(error.message);
    if (error.stack === void 0) delete this.error.stack;
    else this.error.stack = error.stack;
  }
  toString() {
    return this.error.stack ?? this.error.message;
  }
};

export { Exception };
