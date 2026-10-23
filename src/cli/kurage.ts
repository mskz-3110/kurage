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

await (async () => {
  if (argument.options.version) {
    kurage.logger.out(kurage.packageJson.version);
    return;
  }

  const $ = kurage.spellbook;
  const actions = new Map<string, () => Promise<void>>([
    ['eval', evalAsync],
    ['exec-json', execJsonAsync],
    ['exec', execAsync],
    ['info-json', infoJsonAsync],
    ['repl', replAsync],
    ['run', runAsync],
    ['txcl', txclAsync],
  ]);
  let args = argument.args as string[];
  let mode = args.shift() ?? '';
  if (mode === '') {
    if (process.stdin.isTTY) {
      mode = 'repl';
    } else {
      mode = 'eval';
      args = await $.readStreamLinesAsync(process.stdin);
    }
  }

  let action = actions.get(mode);
  if (action != null) {
    process.argv = [...process.argv.slice(0, 2), ...args];
  } else if ($.exists(mode)) {
    action = actions.get('run');
  } else {
    argument.abort(`Invalid arg: ${mode}`);
  }

  await (async () => {
    await action!();
  })();
})();
