import type { ChildProcess, SpawnOptions } from 'node:child_process';
import { Exception } from './exception.js';
import { Stopwatch } from './stopwatch.js';
export type ExecHooks = {
  onStart?: (command: Command) => any;
  onEnd?: (command: Command, context: any) => void;
};
export declare class Command {
  #private;
  static new(...args: ConstructorParameters<typeof Command>): Command;
  get command(): string;
  get args(): readonly string[];
  get stopwatch(): Stopwatch;
  get process(): ChildProcess | undefined;
  get exitCode(): number;
  get exception(): Exception | undefined;
  constructor(args: readonly string[]);
  execAsync(options?: SpawnOptions, hooks?: ExecHooks): Promise<Command>;
  kill: (signal: NodeJS.Signals) => void;
  throwIfException(): Command;
  exit(): void;
  exitIfFailure(): void;
  toString(): string;
}
