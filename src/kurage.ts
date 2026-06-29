import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from './command.js';
import { Exception } from './exception.js';
import { Runtime } from './runtime.js';

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

const execAsync = async (...args: string[]): Promise<Command> => {
  return await Command.new(...args).execAsync();
};

export const kurage = {
  $: async (...args: string[]): Promise<void> => {
    (await execAsync(...args)).throw();
  },
  $command: async (...args: string[]): Promise<Command> => {
    return await execAsync(...args);
  },
  $exit: async (...args: string[]): Promise<void> => {
    (await execAsync(...args)).exit();
  },
  command: Command,
  exception: Exception,
  runtime: Runtime,
  parsePackageJson: (): PackageJson =>
    JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')) as PackageJson,
};

export default kurage;
