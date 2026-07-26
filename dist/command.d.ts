import type { ChildProcess, SpawnOptions, StdioOptions } from 'node:child_process';
import { PassThrough } from 'node:stream';
import { Exception } from './exception.js';
import { Stopwatch } from './stopwatch.js';
export type ExecHooks = {
  onStart?: (command: Command) => any;
  onEnd?: (command: Command, context: any) => void;
};
export declare class Stream extends PassThrough {
  #private;
  static new(...args: ConstructorParameters<typeof PassThrough>): Stream;
  get buffer(): Buffer;
  constructor(...args: ConstructorParameters<typeof PassThrough>);
}
export declare class Command {
  #private;
  static get stream(): typeof Stream;
  static mergeStdio(
    options: SpawnOptions,
    overrideStdio: StdioOptions,
    defaultStdio: StdioOptions
  ): SpawnOptions;
  static new(...args: ConstructorParameters<typeof Command>): Command;
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
  exitIfFailure(): Command;
  toString(): string;
}
