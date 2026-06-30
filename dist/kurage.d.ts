import type { SpawnOptions } from 'node:child_process';
import type { ExecHooks } from './command.js';
import { Command } from './command.js';
import { Exception } from './exception.js';
import { Runtime } from './runtime.js';
import { Stopwatch } from './stopwatch.js';
import { Timestamp } from './timestamp.js';
export type PackageJson = {
  name: string;
  version: string;
  description: string;
};
export declare const kurage: {
  $: <T = void>(args: string[], options?: SpawnOptions, hooks?: ExecHooks<T>) => Promise<void>;
  $command: <T = void>(args: string[], options?: SpawnOptions, hooks?: ExecHooks<T>) => Promise<Command>;
  $exit: <T = void>(args: string[], options?: SpawnOptions, hooks?: ExecHooks<T>) => Promise<void>;
  command: typeof Command;
  exception: typeof Exception;
  runtime: typeof Runtime;
  stopwatch: typeof Stopwatch;
  timestamp: typeof Timestamp;
  parsePackageJson: () => PackageJson;
};
export default kurage;
