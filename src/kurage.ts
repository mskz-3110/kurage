import type { SpawnOptions } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
import type { ExecHooks } from './command.js';
import { Command, defaultExecHooks } from './command.js';
import { Duration } from './duration.js';
import { Exception } from './exception.js';
import { Logger } from './logger.js';
import { Path } from './path.js';
import { Process } from './process.js';
import { Runtime } from './runtime.js';
import { Spellbook } from './spellbook.js';
import { Stopwatch } from './stopwatch.js';
import { Timestamp } from './timestamp.js';

export type PackageJson = {
  name: string;
  version: string;
  description: string;
};

const execAsync = async <T = void>(
  args: readonly string[],
  options: SpawnOptions = {},
  hooks: ExecHooks<T> = defaultExecHooks as any
): Promise<Command> => {
  return await Command.new(args).execAsync<T>(options, hooks);
};

export const kurage = {
  $: async <T = void>(
    args: readonly string[],
    options: SpawnOptions = {},
    hooks?: ExecHooks<T>
  ): Promise<void> => {
    (await execAsync(args, options, hooks)).throwIfException();
  },
  $command: async <T = void>(
    args: readonly string[],
    options: SpawnOptions = {},
    hooks?: ExecHooks<T>
  ): Promise<Command> => {
    return await execAsync(args, options, hooks);
  },
  $exit: async <T = void>(
    args: readonly string[],
    options: SpawnOptions = {},
    hooks?: ExecHooks<T>
  ): Promise<void> => {
    (await execAsync(args, options, hooks)).exit();
  },
  $out: async (
    args: readonly string[],
    encoding: BufferEncoding = 'utf8'
  ): Promise<string> => {
    const command = Command.new(args);
    const exec = command.execAsync({ stdio: ['inherit', 'pipe', 'ignore'] }, {});
    const chunks: Buffer[] = [];
    command.process!.stdout!.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });
    (await exec).throwIfException();
    return Buffer.concat(chunks).toString(encoding).trimEnd();
  },
  $ok: async (args: readonly string[]): Promise<boolean> => {
    return (
      (await kurage.$command(args, { stdio: ['inherit', 'ignore', 'ignore'] }, {}))
        .exitCode === 0
    );
  },
  backtrace: Backtrace,
  color: Color,
  command: Command,
  duration: Duration,
  exception: Exception,
  log: (name: string, arg: unknown, timestamp?: Timestamp) => {
    return Logger.$.write(name, arg, timestamp);
  },
  logger: Logger,
  path: Path,
  process: Process,
  runtime: Runtime,
  spellbook: Spellbook,
  stopwatch: Stopwatch,
  timestamp: Timestamp,
  parsePackageJson: (): PackageJson =>
    JSON.parse(
      readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')
    ) as PackageJson,
};

export default kurage;
