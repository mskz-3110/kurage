import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from './command.js';

export type PackageJson = {
  name: string;
  version: string;
  description: string;
};

process.on('uncaughtException', (e) => {
  console.error(`Uncaught Exception: ${e instanceof Error ? e.stack : String(e)}`);
});

process.on('unhandledRejection', (reason) => {
  console.error(`Unhandled Rejection: ${reason instanceof Error ? reason.stack : String(reason)}`);
});

export const kurage = {
  $: async (...args: string[]): Promise<void> => {
    await Command.new(...args).execAsync();
  },
  command: Command,
  parsePackageJson: (): PackageJson =>
    JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')) as PackageJson,
};

export default kurage;
