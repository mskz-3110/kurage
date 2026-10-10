import { Time } from './time.js';
export type Write = (message: string) => void;
export type Format = (time: Time, arg: any) => string;
export type Handler = {
  write: Write;
  format: Format;
};
export declare class Logger {
  #private;
  static out(message: string): void;
  static err(message: string): void;
  static addOutStream(stream: NodeJS.WritableStream): void;
  static addErrStream(stream: NodeJS.WritableStream): void;
  static format(time: Time, arg: any): string;
  static get names(): readonly string[];
  static getHandlers(name: string): Handler[];
  static setHandlers(name: string, handlers: Handler[]): void;
  static addHandler(name: string, handler: Handler): void;
  static write(name: string, arg: any, time?: Time): void;
}
