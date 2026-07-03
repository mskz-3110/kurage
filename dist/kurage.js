import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
import { Command, defaultExecHooks } from './command.js';
import { Duration } from './duration.js';
import { Exception } from './exception.js';
import { Process } from './process.js';
import { Runtime } from './runtime.js';
import { Stopwatch } from './stopwatch.js';
import { Timestamp } from './timestamp.js';

const execAsync = async (args, options = {}, hooks = {}) => {
  return await Command.new(...args).execAsync(options, hooks);
};
const kurage = {
  $: async (args, options = {}, hooks) => {
    (await execAsync(args, options, hooks ?? defaultExecHooks)).throwIfException();
  },
  $command: async (args, options = {}, hooks) => {
    return await execAsync(args, options, hooks ?? defaultExecHooks);
  },
  $exit: async (args, options = {}, hooks) => {
    (await execAsync(args, options, hooks ?? defaultExecHooks)).exit();
  },
  $out: async (args, encoding = 'utf8') => {
    const command = Command.new(...args);
    const exec = command.execAsync({ stdio: ['inherit', 'pipe', 'inherit'] });
    const chunks = [];
    command.process.stdout.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });
    (await exec).throwIfException();
    return Buffer.concat(chunks).toString(encoding).trimEnd();
  },
  backtrace: Backtrace,
  color: Color,
  command: Command,
  duration: Duration,
  exception: Exception,
  process: Process,
  runtime: Runtime,
  stopwatch: Stopwatch,
  timestamp: Timestamp,
  parsePackageJson: () => JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')),
};

export { kurage as default, kurage };
