import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command, defaultExecHooks } from './command.js';
import { Exception } from './exception.js';
import { Runtime } from './runtime.js';
import { Stopwatch } from './stopwatch.js';
import { Timestamp } from './timestamp.js';

process.on('uncaughtException', (e) => {
  console.error(`UncaughtException: ${Exception.new(e)}`);
});
process.on('unhandledRejection', (reason) => {
  console.error(`UnhandledRejection: ${Exception.new(reason)}`);
});
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
  command: Command,
  exception: Exception,
  runtime: Runtime,
  stopwatch: Stopwatch,
  timestamp: Timestamp,
  parsePackageJson: () => JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')),
};

export { kurage as default, kurage };
