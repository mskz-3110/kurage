import { Timestamp } from './timestamp.js';
export type Write = (message: string) => void;
export type Format = (timestamp: Timestamp, arg: any) => string;
export type Handler = {
  write: Write;
  format: Format;
};
export declare class Logger {
  #private;
  static $: Logger;
  static format(timestamp: Timestamp, arg: any): string;
  static new(...args: ConstructorParameters<typeof Logger>): Logger;
  get names(): readonly string[];
  getHandlers(name: string): Handler[];
  setHandlers(name: string, handlers: Handler[]): void;
  addHandler(name: string, handler: Handler): void;
  write(name: string, arg: any, timestamp?: Timestamp): void;
}
