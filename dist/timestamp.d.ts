export declare class Timestamp {
  #private;
  static formatter: Intl.DateTimeFormat;
  static new(...args: ConstructorParameters<typeof Timestamp>): Timestamp;
  get date(): Date;
  constructor(value?: Timestamp | Date | string);
  toString(): string;
}
