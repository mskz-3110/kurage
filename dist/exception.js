var Exception = class Exception {
  static new(...args) {
    return new Exception(...args);
  }
  error;
  constructor(error) {
    if (error instanceof Exception) this.error = error.error;
    else if (error instanceof Error) this.error = new Error(error.message);
    else this.error = new Error(String(error));
  }
  toString() {
    return this.error.stack ?? this.error.message;
  }
};

export { Exception };
