export declare class Time {
  #private;
  static get formatter(): Intl.DateTimeFormat;
  static get driftThreshold(): number;
  static set driftThreshold(value: number);
  static now(): number;
  static new(...args: ConstructorParameters<typeof Time>): Time;
  get date(): Date;
  constructor();
  since(baseTime: Time): number;
  toString(formatter?: Intl.DateTimeFormat): string;
}
