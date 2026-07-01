import type { ChildProcess, SpawnOptions } from 'node:child_process';
import { Exception } from './exception.js';
export interface ExecHooks<T> {
  onStart?: (command: Command) => T;
  onEnd?: (command: Command, context: T) => void;
}
export declare const defaultExecHooks: ExecHooks<void>;
export declare class Command {
  #private;
  static new(...args: ConstructorParameters<typeof Command>): Command;
  get command(): string;
  get args(): string[];
  get duration(): number;
  get process(): ChildProcess | undefined;
  get exitCode(): number;
  get exception(): Exception | undefined;
  constructor(...args: string[]);
  execAsync<T = void>(options?: SpawnOptions, hooks?: ExecHooks<T>): Promise<Command>;
  throwIfException(): void;
  exit(): void;
  toString(): string;
}
