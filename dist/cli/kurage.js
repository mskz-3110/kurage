#!/usr/bin/env node
import kurage from '../kurage.js';
import { evalAsync } from './eval.js';
import { execAsync } from './exec.js';
import { execJsonAsync } from './exec-json.js';
import { infoJsonAsync } from './info-json.js';
import { replAsync } from './repl.js';
import { runAsync } from './run.js';
import { txclAsync } from './txcl.js';

const packageName = kurage.packageJson.name;
const argument = kurage.argument
  .new(packageName)
  .command('repl', 'Start REPL mode (default)')
  .command('eval <code>', 'Evaluate JavaScript code')
  .command('exec <command> [args...]', 'Execute a command')
  .command('exec-json <command> [args...]', 'Execute a command and output result as JSON')
  .command('run <file> [args...]', 'Run a file')
  .command('<file> [args...]', 'Run a file')
  .command('info-json', 'Show system information and output result as JSON')
  .command('txcl <files...>', 'Process file transclusions')
  .option('-v, --version', 'Show version number', false)
  .example(packageName)
  .example(`${packageName} repl`)
  .example(
    `${packageName} eval "kurage.logger.out(${packageName}.spellbook.inspect(${packageName}));"`
  )
  .example(`${packageName} exec cat script.js`)
  .example(`${packageName} exec-json cat script.js`)
  .example(`${packageName} run script.js`)
  .example(`${packageName} script.js`)
  .example(`${packageName} info-json`)
  .example(`${packageName} txcl README.md`)
  .parse(process.argv.slice(2));
const actions = {
  'eval': evalAsync,
  'exec-json': execJsonAsync,
  'exec': execAsync,
  'info-json': infoJsonAsync,
  'repl': replAsync,
  'run': runAsync,
  'txcl': txclAsync,
};
const action = actions[(argument.args[0] ?? 'repl').toLowerCase()];
if (argument.options.version) kurage.logger.out(kurage.packageJson.version);
else if (action != null) {
  if (argument.args[0] != null) process.argv = process.argv.slice(1);
  (async () => {
    await action();
  })();
} else if (kurage.spellbook.exists(argument.args[0]))
  (async () => {
    await actions.run();
  })();
else argument.abort(`Invalid args: ${argument.args.join(' ')}`);
