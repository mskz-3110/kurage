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
  static format(payload: Payload): string;
  static new(...args: ConstructorParameters<typeof Logger>): Logger;
  get names(): string[];
  addHandler(name: string, handler: Handler): void;
  write(name: string, args: unknown[], timestamp?: Timestamp): void;
}
export {};
