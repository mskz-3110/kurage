export declare class Exception {
  static new(...args: ConstructorParameters<typeof Exception>): Exception;
  error: Error;
  constructor(error: unknown);
  toString(): string;
}
