var Exception = class Exception {
  static new(...args) {
    return new Exception(...args);
  }
  error;
  constructor(error) {
    if (error instanceof Exception) {
      this.error = new Error(error.error.message);
      this.error.stack = error.error.stack ?? '';
    } else if (error instanceof Error) {
      this.error = new Error(error.message);
      this.error.stack = error.stack ?? '';
    } else this.error = new Error(String(error));
  }
  toString() {
    return this.error.stack ?? this.error.message;
  }
};

export { Exception };
