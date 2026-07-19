import type { PackageJson } from '../kurage.js';
import kurage from '../kurage.js';

const createHelpMessage = (packageJson: PackageJson): string => {
  return `
Usage: ${packageJson.name} [options] [commands...]

${packageJson.description}

Commands:
  repl                          start REPL mode (default)
  exec <command> [args...]      execute a command
  exec-json <command> [args...] execute a command and output result as JSON
  run <file> [args...]          run a file
  info-json                     show system information and output result as JSON
  txcl <files...>               process file transclusions

Options:
  -v, --version                 show version number
  -h, --help                    show help message

Examples:
  ${packageJson.name}
  ${packageJson.name} repl
  ${packageJson.name} exec cat script.js
  ${packageJson.name} exec-json cat script.js
  ${packageJson.name} run script.js
  ${packageJson.name} script.js
  ${packageJson.name} info-json
  ${packageJson.name} txcl README.md
`.trim();
};

let mode = (process.argv[2] ?? '').toLowerCase();
if (mode === '') {
  mode = 'repl';
  process.argv.push(mode);
  import(`./${mode}.js`);
} else if (['repl', 'exec', 'exec-json', 'run', 'info-json', 'txcl'].includes(mode)) {
  process.argv = process.argv.slice(1);
  import(`./${mode}.js`);
} else if (['-v', '--version'].includes(mode)) {
  console.log(kurage.parsePackageJson().version);
} else if (['-h', '--help'].includes(mode)) {
  console.log(createHelpMessage(kurage.parsePackageJson()));
} else if (kurage.spellbook.exists(process.argv[2]!)) {
  import(`./run.js`);
} else {
  console.error(
    kurage.color.$.paint('error', `Invalid args: ${kurage.process.args.join(' ')}`)
  );
  console.log(createHelpMessage(kurage.parsePackageJson()));
  process.exit(1);
}
