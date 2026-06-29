import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from './command.js';
import { Exception } from './exception.js';
import { Runtime } from './runtime.js';

process.on('uncaughtException', (e) => {
  console.error(`UncaughtException: ${Exception.new(e)}`);
});
process.on('unhandledRejection', (reason) => {
  console.error(`UnhandledRejection: ${Exception.new(reason)}`);
});
const execAsync = async (...args) => {
  return await Command.new(...args).execAsync();
};
const kurage = {
  $: async (...args) => {
    (await execAsync(...args)).throw();
  },
  $command: async (...args) => {
    return await execAsync(...args);
  },
  $exit: async (...args) => {
    (await execAsync(...args)).exit();
  },
  command: Command,
  exception: Exception,
  runtime: Runtime,
  parsePackageJson: () => JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')),
};

export { kurage as default, kurage };
