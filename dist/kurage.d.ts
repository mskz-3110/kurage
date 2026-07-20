import type { SpawnOptions } from 'node:child_process';
import { Backtrace } from './backtrace.js';
import { Bytes } from './bytes.js';
import { Color } from './color.js';
import type { ExecHooks } from './command.js';
import { Command } from './command.js';
import { Duration } from './duration.js';
import { Exception } from './exception.js';
import { Line } from './line.js';
import { Logger } from './logger.js';
import { Path } from './path.js';
import { Process } from './process.js';
import { Runtime } from './runtime.js';
import { Spellbook } from './spellbook.js';
import { Stopwatch } from './stopwatch.js';
import { Timestamp } from './timestamp.js';
import { Transcluder } from './transcluder.js';
export type PackageJson = {
  name: string;
  version: string;
  description: string;
};
export declare const kurage: {
  $: (
    args: readonly string[],
    options?: SpawnOptions,
    hooks?: ExecHooks
  ) => Promise<void>;
  $command: (
    args: readonly string[],
    options?: SpawnOptions,
    hooks?: ExecHooks
  ) => Promise<Command>;
  $exit: (
    args: readonly string[],
    options?: SpawnOptions,
    hooks?: ExecHooks
  ) => Promise<void>;
  $out: (
    args: readonly string[],
    options?: SpawnOptions,
    encoding?: BufferEncoding
  ) => Promise<string>;
  $ok: (args: readonly string[], options?: SpawnOptions) => Promise<boolean>;
  backtrace: typeof Backtrace;
  bytes: typeof Bytes;
  color: typeof Color;
  command: typeof Command;
  duration: typeof Duration;
  exception: typeof Exception;
  line: typeof Line;
  log: (name: string, arg: unknown, timestamp?: Timestamp) => void;
  logger: typeof Logger;
  path: typeof Path;
  process: typeof Process;
  runtime: typeof Runtime;
  spellbook: typeof Spellbook;
  stopwatch: typeof Stopwatch;
  timestamp: typeof Timestamp;
  transcluder: typeof Transcluder;
  readonly packageJson: PackageJson;
};
export default kurage;
