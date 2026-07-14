import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
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

const execAsync = async (args, options = {}, hooks) => {
  return await Command.new(args).execAsync(options, hooks);
};
const kurage = {
  $: async (args, options = {}, hooks) => {
    (await execAsync(args, options, hooks)).exitIfFailure();
  },
  $command: async (args, options = {}, hooks) => {
    return await execAsync(args, options, hooks);
  },
  $exit: async (args, options = {}, hooks) => {
    (await execAsync(args, options, hooks)).exit();
  },
  $out: async (args, encoding = 'utf8') => {
    const command = Command.new(args);
    const exec = command.execAsync({ stdio: ['inherit', 'pipe', 'ignore'] }, {});
    const chunks = [];
    command.process.stdout.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });
    (await exec).exitIfFailure();
    return Buffer.concat(chunks).toString(encoding).trimEnd();
  },
  $ok: async (args, options = {}) => {
    return (
      (
        await kurage.$command(
          args,
          {
            stdio: ['inherit', 'ignore', 'ignore'],
            ...options,
          },
          {}
        )
      ).exitCode === 0
    );
  },
  backtrace: Backtrace,
  color: Color,
  command: Command,
  duration: Duration,
  exception: Exception,
  line: Line,
  log: (name, arg, timestamp) => {
    return Logger.$.write(name, arg, timestamp);
  },
  logger: Logger,
  path: Path,
  process: Process,
  runtime: Runtime,
  spellbook: Spellbook,
  stopwatch: Stopwatch,
  timestamp: Timestamp,
  parsePackageJson: () =>
    JSON.parse(
      readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')
    ),
};

export { kurage as default, kurage };
