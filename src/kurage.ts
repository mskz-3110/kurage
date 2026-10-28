import type { SpawnOptions } from 'node:child_process';
import packageJson from '../package.json' with { type: 'json' };
import { Argument } from './argument.js';
import type { Frame } from './backtrace.js';
import { Backtrace } from './backtrace.js';
import { Bytes } from './bytes.js';
import { Color } from './color.js';
import type { ExecHooks } from './command.js';
import { Command, Stream } from './command.js';
import { Duration } from './duration.js';
import { Exception } from './exception.js';
import { Line } from './line.js';
import { Logger } from './logger.js';
import { Path } from './path.js';
import { Process } from './process.js';
import { Spellbook } from './spellbook.js';
import { Stopwatch } from './stopwatch.js';
import { Time } from './time.js';
import { Transcluder } from './transcluder.js';

export type PackageJson = {
  name: string;
  version: string;
  description: string;
};

const runtimeName = Object.hasOwn(process.versions, 'bun') ? 'bun' : 'node';

const execAsync = async (
  args: readonly string[],
  options: SpawnOptions = {},
  hooks?: ExecHooks,
  caller?: Frame
): Promise<Command> => {
  return await Command.new(args).execAsync(options, hooks, caller);
};

export const kurage = {
  isMain: (importMetaMain: boolean, scriptPath: string): boolean => {
    return importMetaMain || process.argv[1] === Spellbook.absolute(scriptPath);
  },
  setupGlobals: (target: object) => {
    Object.assign(target, {
      kurage,
      $: kurage.spellbook,
    });
  },
  $: async (
    args: readonly string[],
    options: SpawnOptions = {},
    hooks?: ExecHooks
  ): Promise<void> => {
    (await execAsync(args, options, hooks, Backtrace.caller(1))).exitIfFailure();
  },
  $command: async (
    args: readonly string[],
    options: SpawnOptions = {},
    hooks?: ExecHooks
  ): Promise<Command> => {
    return await execAsync(args, options, hooks, Backtrace.caller(1));
  },
  $exit: async (
    args: readonly string[],
    options: SpawnOptions = {},
    hooks?: ExecHooks
  ): Promise<void> => {
    (await execAsync(args, options, hooks, Backtrace.caller(1))).exit();
  },
  $out: async (
    args: readonly string[],
    options: SpawnOptions = {},
    encoding: BufferEncoding = 'utf8'
  ): Promise<string> => {
    const stdout = Stream.new();
    const stdoutBuffer = stdout.buffer();
    await execAsync(
      args,
      Command.mergeStdio(
        options,
        [undefined, stdout, undefined],
        ['ignore', stdout, 'ignore']
      ),
      {},
      Backtrace.caller(1)
    );
    return (await stdoutBuffer).toString(encoding).trimEnd();
  },
  $ok: async (args: readonly string[], options: SpawnOptions = {}): Promise<boolean> => {
    return (
      (
        await execAsync(
          args,
          { stdio: ['ignore', 'ignore', 'ignore'], ...options },
          {},
          Backtrace.caller(1)
        )
      ).exitCode === 0
    );
  },
  backtrace: Backtrace,
  argument: Argument,
  bytes: Bytes,
  color: Color,
  command: Command,
  duration: Duration,
  exception: Exception,
  line: Line,
  log: (name: string, arg: unknown, time?: Time) => {
    return Logger.write(name, arg, time);
  },
  logger: Logger,
  path: Path,
  process: Process,
  spellbook: Spellbook,
  stopwatch: Stopwatch,
  time: Time,
  transcluder: Transcluder,
  get runtimeName() {
    return runtimeName;
  },
  get packageJson(): PackageJson {
    return packageJson;
  },
};

export default kurage;
