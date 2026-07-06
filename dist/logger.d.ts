import { Timestamp } from './timestamp.js';
export type Write = (message: string) => void;
export type Format<T = any> = (timestamp: Timestamp, arg: T) => string;
interface Handler<T = any> {
  write: Write;
  format: Format<T>;
}
export declare class Logger {
  #private;
  static $: Logger;
  static format(timestamp: Timestamp, arg: any): string;
  static new(...args: ConstructorParameters<typeof Logger>): Logger;
  get names(): string[];
  addHandler<T>(name: string, handler: Handler<T>): void;
  write<T>(name: string, arg: T, timestamp?: Timestamp): void;
}
export {};
