#!/usr/bin/env node
import kurage from '../kurage.js';

const cliModes = ['info', 'repl', 'exec', 'run'];
const mode = (process.argv[2] ?? cliModes[0]).toLowerCase();
const createHelpMessage = (packageJson) => {
  return `
Usage: ${packageJson.name} [options] [commands...]

${packageJson.description}

Commands:
  info                   show info (default)
  repl                   start REPL mode
  exec <command...>      execute a command
  run <file> [args...]   run a file

Options:
  -v, --version          show version number
  -h, --help             show help message

Examples:
  ${packageJson.name}
  ${packageJson.name} info
  ${packageJson.name} repl
  ${packageJson.name} exec cat script.js
  ${packageJson.name} run script.js
`.trim();
};
if (cliModes.includes(mode)) {
  process.argv = process.argv.slice(1);
  if (process.argv.length < 2) process.argv.push(mode);
  import(`./${mode}.js`);
} else if (['-v', '--version'].includes(mode)) console.log(kurage.parsePackageJson().version);
else if (['-h', '--help'].includes(mode)) console.log(createHelpMessage(kurage.parsePackageJson()));
else {
  console.error(kurage.color.$.paint('red', `Invalid args: ${kurage.process.args.join(' ')}`));
  console.log(createHelpMessage(kurage.parsePackageJson()));
  process.exit(1);
}
