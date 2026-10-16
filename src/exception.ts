export class Exception {
  static new(...args: ConstructorParameters<typeof Exception>): Exception {
    return new Exception(...args);
  }

  error: Error;

  constructor(error: unknown) {
    if (error instanceof Exception) {
      this.error = error.error;
    } else if (error instanceof Error) {
      this.error = new Error(error.message);
    } else {
      this.error = new Error(String(error));
    }
  }

  toString(): string {
    return this.error.stack ?? this.error.message;
  }
}
