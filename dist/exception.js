var Exception = class Exception {
  static new(...args) {
    return new Exception(...args);
  }
  error;
  constructor(error) {
    if (error instanceof Exception) this.error = error.error;
    else if (error instanceof Error) this.error = error;
    else this.error = new Error(String(error));
  }
  appendMessage(message) {
    this.error.message = `${this.error.message}${message}`;
    return this;
  }
  toString() {
    return this.error.stack ?? this.error.message;
  }
};

export { Exception };
