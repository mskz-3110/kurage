export class Exception {
  static new(...args: ConstructorParameters<typeof Exception>): Exception {
    return new Exception(...args);
  }

  error: Error;

  constructor(error: unknown) {
    if (error instanceof Exception) {
      this.error = error.error;
    } else if (error instanceof Error) {
      this.error = error;
    } else {
      this.error = new Error(String(error));
    }
  }

  appendMessage(message: string): Exception {
    this.error.message = `${this.error.message}${message}`;
    return this;
  }

  toString(): string {
    return this.error.stack ?? this.error.message;
  }
}
