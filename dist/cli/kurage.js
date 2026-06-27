#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cliModes = ['repl', 'exec', 'run'];
const arg = (process.argv[2] ?? cliModes[0]).toLowerCase();
const getPackageJson = () =>
  JSON.parse(readFileSync(fileURLToPath(new URL('../../package.json', import.meta.url)), 'utf8'));
const getHelpMessage = (packageJson) => {
  return `
Usage: ${packageJson.name} [options] [commands...]

${packageJson.description}

Commands:
  repl                   start REPL mode
  exec <command...>      execute a command
  run <file> [args...]   run a file

Options:
  -v, --version          show version number
  -h, --help             show help message

Examples:
  ${packageJson.name}
  ${packageJson.name} repl
  ${packageJson.name} exec cat script.js
  ${packageJson.name} run script.js
`.trim();
};
if (cliModes.includes(arg)) import(`./kurage-${arg}.js`);
else if (['-v', '--version'].includes(arg)) console.log(getPackageJson().version);
else if (['-h', '--help'].includes(arg)) console.log(getHelpMessage(getPackageJson()));
else {
  console.error(`Invalid command: ${process.argv.slice(2).join(' ')}`);
  console.error(getHelpMessage(getPackageJson()));
  process.exit(1);
}
