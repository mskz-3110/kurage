import type { SpawnOptions } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { ExecHooks } from './command.js';
import { Command, defaultExecHooks } from './command.js';
import { Exception } from './exception.js';
import { Runtime } from './runtime.js';
import { Stopwatch } from './stopwatch.js';
import { Timestamp } from './timestamp.js';

export type PackageJson = {
  name: string;
  version: string;
  description: string;
};

process.on('uncaughtException', (e) => {
  console.error(`UncaughtException: ${Exception.new(e)}`);
});

process.on('unhandledRejection', (reason) => {
  console.error(`UnhandledRejection: ${Exception.new(reason)}`);
});

const execAsync = async <T = void>(
  args: string[],
  options: SpawnOptions = {},
  hooks: ExecHooks<T> = {}
): Promise<Command> => {
  return await Command.new(...args).execAsync<T>(options, hooks);
};

export const kurage = {
  $: async <T = void>(args: string[], options: SpawnOptions = {}, hooks?: ExecHooks<T>): Promise<void> => {
    (await execAsync(args, options, (hooks ?? defaultExecHooks) as ExecHooks<T>)).throwIfException();
  },
  $command: async <T = void>(args: string[], options: SpawnOptions = {}, hooks?: ExecHooks<T>): Promise<Command> => {
    return await execAsync(args, options, (hooks ?? defaultExecHooks) as ExecHooks<T>);
  },
  $exit: async <T = void>(args: string[], options: SpawnOptions = {}, hooks?: ExecHooks<T>): Promise<void> => {
    (await execAsync(args, options, (hooks ?? defaultExecHooks) as ExecHooks<T>)).exit();
  },
  command: Command,
  exception: Exception,
  runtime: Runtime,
  stopwatch: Stopwatch,
  timestamp: Timestamp,
  parsePackageJson: (): PackageJson =>
    JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')) as PackageJson,
};

export default kurage;
