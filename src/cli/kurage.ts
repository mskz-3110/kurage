import type { PackageJson } from '../kurage.js';
import kurage from '../kurage.js';

const cliModes = ['repl', 'exec', 'run', 'info'];
const mode = (process.argv[2] ?? cliModes[0]!).toLowerCase();

const createHelpMessage = (packageJson: PackageJson): string => {
  return `
Usage: ${packageJson.name} [options] [commands...]

${packageJson.description}

Commands:
  repl                     start REPL mode (default)
  exec <command> [args...] execute a command
  run <file> [args...]     run a file
  info                     show info

Options:
  -v, --version            show version number
  -h, --help               show help message

Examples:
  ${packageJson.name}
  ${packageJson.name} repl
  ${packageJson.name} exec cat script.js
  ${packageJson.name} run script.js
  ${packageJson.name} script.js
  ${packageJson.name} info
`.trim();
};

if (cliModes.includes(mode)) {
  process.argv = process.argv.slice(1);
  if (process.argv.length < 2) {
    process.argv.push(mode);
  }
  import(`./${mode}.js`);
} else if (['-v', '--version'].includes(mode)) {
  console.log(kurage.parsePackageJson().version);
} else if (['-h', '--help'].includes(mode)) {
  console.log(createHelpMessage(kurage.parsePackageJson()));
} else if (kurage.path.exists(process.argv[2]!)) {
  import(`./run.js`);
} else {
  console.error(
    kurage.color.$.paint('red', `Invalid args: ${kurage.process.args.join(' ')}`)
  );
  console.log(createHelpMessage(kurage.parsePackageJson()));
  process.exit(1);
}
