import type { PackageJson } from '../kurage.js';
import kurage from '../kurage.js';
import { evalAsync } from './eval.js';
import { execAsync } from './exec.js';
import { execJsonAsync } from './exec-json.js';
import { infoJsonAsync } from './info-json.js';
import { replAsync } from './repl.js';
import { runAsync } from './run.js';
import { txclAsync } from './txcl.js';

const createHelpMessage = (packageJson: PackageJson): string => {
  return `
Usage: ${packageJson.name} [options] [commands...]

${packageJson.description}

Commands:
  repl                          start REPL mode (default)
  eval <code>                   evaluate JavaScript code
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
  ${packageJson.name} eval "console.log($.inspect(kurage));"
  ${packageJson.name} exec cat script.js
  ${packageJson.name} exec-json cat script.js
  ${packageJson.name} run script.js
  ${packageJson.name} script.js
  ${packageJson.name} info-json
  ${packageJson.name} txcl README.md
`.trim();
};

const cliActions: Record<string, () => Promise<void>> = {
  'eval': evalAsync,
  'exec-json': execJsonAsync,
  'exec': execAsync,
  'info-json': infoJsonAsync,
  'repl': replAsync,
  'run': runAsync,
  'txcl': txclAsync,
};
const mode = (process.argv[2] ?? '').toLowerCase();
if (mode === '') {
  (async () => {
    await cliActions.repl!();
  })();
} else if (Object.keys(cliActions).includes(mode)) {
  process.argv = process.argv.slice(1);
  (async () => {
    await cliActions[mode]!();
  })();
} else if (['-v', '--version'].includes(mode)) {
  console.log(kurage.packageJson.version);
} else if (['-h', '--help'].includes(mode)) {
  console.log(createHelpMessage(kurage.packageJson));
} else if (kurage.spellbook.exists(process.argv[2]!)) {
  (async () => {
    await cliActions.run!();
  })();
} else {
  console.error(
    kurage.color.$.paint('error', `Invalid args: ${kurage.process.args.join(' ')}`)
  );
  console.log(createHelpMessage(kurage.packageJson));
  process.exit(1);
}
