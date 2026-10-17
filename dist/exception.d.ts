export declare class Exception {
  #private;
  static new(...args: ConstructorParameters<typeof Exception>): Exception;
  error: Error;
  constructor(error: unknown);
  toString(): string;
}
