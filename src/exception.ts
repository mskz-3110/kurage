export class Exception {
  static new(...args: ConstructorParameters<typeof Exception>): Exception {
    return new Exception(...args);
  }

  error!: Error;

  constructor(error: unknown) {
    if (error instanceof Exception) {
      this.#setError(error.error);
    } else if (error instanceof Error) {
      this.#setError(error);
    } else {
      this.error = new Error(String(error));
    }
  }

  #setError(error: Error) {
    this.error = new Error(error.message);
    if (error.stack === undefined) {
      delete this.error.stack;
    } else {
      this.error.stack = error.stack;
    }
  }

  toString(): string {
    return this.error.stack ?? this.error.message;
  }
}
