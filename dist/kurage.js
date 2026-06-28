import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Command } from './command.js';

process.on('uncaughtException', (e) => {
  console.error(`Uncaught Exception: ${e instanceof Error ? e.message : String(e)}`);
});
process.on('unhandledRejection', (reason) => {
  console.error(`Unhandled Rejection: ${reason instanceof Error ? reason.message : String(reason)}`);
});
const kurage = {
  $: async (...args) => {
    if (args.length === 0) return;
    await Command.new(args[0], ...args.slice(1)).execAsync();
  },
  command: Command,
  parsePackageJson: () => JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')),
};

export { kurage as default, kurage };
