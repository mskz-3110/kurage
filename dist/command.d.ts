import type { ChildProcess, StdioOptions } from 'node:child_process';
export declare class Command {
  #private;
  static new(...args: ConstructorParameters<typeof Command>): Command;
  get command(): string;
  get args(): string[];
  get process(): ChildProcess | undefined;
  constructor(command: string, ...args: string[]);
  execAsync(stdio?: StdioOptions): Promise<void>;
  toString(): string;
}
