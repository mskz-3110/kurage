import type { ChildProcess, SpawnOptions } from 'node:child_process';
import { Exception } from './exception.js';
export declare class Command {
  #private;
  static new(...args: ConstructorParameters<typeof Command>): Command;
  get command(): string;
  get args(): string[];
  get process(): ChildProcess | undefined;
  get exception(): Exception | undefined;
  constructor(...args: string[]);
  execAsync({ stdio, ...others }?: SpawnOptions): Promise<Command>;
  throw(): void;
  exit(): void;
  toString(): string;
}
