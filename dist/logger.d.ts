import { Timestamp } from './timestamp.js';
export interface Payload {
  timestamp: Timestamp;
  args: unknown[];
}
export type Write = (message: string) => void;
export type Format = (payload: Payload) => string;
interface Handler {
  write: Write;
  format: Format;
}
export declare class Logger {
  #private;
  static logger: Logger;
  static new(...args: ConstructorParameters<typeof Logger>): Logger;
  get names(): string[];
  constructor();
  write(name: string, args: unknown[], timestamp?: Timestamp): void;
  format: Format;
  addHandler(name: string, handler: Handler): void;
}
export {};
