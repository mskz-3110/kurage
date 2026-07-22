export declare class Time {
  #private;
  static formatter: Intl.DateTimeFormat;
  static get driftThreshold(): number;
  static set driftThreshold(value: number);
  static now(): number;
  static new(...args: ConstructorParameters<typeof Time>): Time;
  get date(): Date;
  constructor();
  since(baseTime: Time): number;
  toString(): string;
}
