import packageJson from '../package.json' with { type: 'json' };
import { Argument } from './argument.js';
import { Backtrace } from './backtrace.js';
import { Bytes } from './bytes.js';
import { Color } from './color.js';
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

const runtimeName = Object.hasOwn(process.versions, 'bun') ? 'bun' : 'node';
const execAsync = async (args, options = {}, hooks, caller) => {
  return await Command.new(args).execAsync(options, hooks, caller);
};
const kurage = {
  isMain: (importMetaMain, scriptPath) => {
    return importMetaMain || process.argv[1] === Spellbook.absolute(scriptPath);
  },
  setupGlobals: (target) => {
    Object.assign(target, {
      kurage,
      $: kurage.spellbook,
    });
  },
  $: async (args, options = {}, hooks) => {
    (await execAsync(args, options, hooks, Backtrace.caller(1))).exitIfFailure();
  },
  $command: async (args, options = {}, hooks) => {
    return await execAsync(args, options, hooks, Backtrace.caller(1));
  },
  $exit: async (args, options = {}, hooks) => {
    (await execAsync(args, options, hooks, Backtrace.caller(1))).exit();
  },
  $out: async (args, options = {}, encoding = 'utf8') => {
    const stdout = Stream.new({ maxBufferSize: Stream.maxBufferSize });
    await execAsync(
      args,
      Command.mergeStdio(options, [void 0, stdout, void 0], ['ignore', stdout, 'ignore']),
      {},
      Backtrace.caller(1)
    );
    return stdout.buffer.toString(encoding).trimEnd();
  },
  $ok: async (args, options = {}) => {
    return (
      (
        await execAsync(
          args,
          {
            stdio: ['ignore', 'ignore', 'ignore'],
            ...options,
          },
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
  log: (name, arg, time) => {
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
  get packageJson() {
    return packageJson;
  },
};

export { kurage as default, kurage };
