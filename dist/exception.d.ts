export declare class Exception {
  static new(...args: ConstructorParameters<typeof Exception>): Exception;
  error: Error;
  constructor(error: unknown);
  appendMessage(message: string): Exception;
  toString(): string;
}
