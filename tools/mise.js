#!/usr/bin/env node
const { kurage } = await import('kurage');

const actions = new Map([
  ['install', installAsync],
  ['uninstall', uninstallAsync],
]);

async function installAsync() {
  kurage.logger.out('install');
}

async function uninstallAsync() {
  kurage.logger.out('uninstall');
}

const argument = kurage.argument
  .new('mise')
  .option('-v, --version', 'Show version information', false)
  .command('install', 'Install mise')
  .command('uninstall', 'Uninstall mise')
  .parse(kurage.process.args);
if (argument.options.version) {
  const commands = ['mise', 'node', 'bun', 'pnpm'];
  const versions = {};

  for (const command of commands) {
    versions[command] = (await kurage.$out([command, '--version'])) || null;
  }

  kurage.logger.out(JSON.stringify(versions, null, 2));
  process.exit(0);
}

const mode = argument.args[0] ?? '';
const action = actions.get(mode);
if (action == null) {
  argument.abort(`Invalid arg: ${mode}`);
}

await action();
