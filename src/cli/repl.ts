import type { SpawnOptions } from 'node:child_process';
import kurage from '../kurage.js';

const packageJson = kurage.parsePackageJson();
let replCode = '';
if (
  await kurage.$ok([
    'node',
    '-e',
    `const { ${packageJson.name} } = await import('${packageJson.name}');process.exit(typeof kurage !== undefined ? 0 : 1);`,
  ])
) {
  replCode = [
    `const { ${packageJson.name} } = await import('${packageJson.name}');`,
    `const $ = ${packageJson.name}.spellbook;`,
  ].join('');
} else {
  replCode = [
    `${packageJson.name} = (await import('${packageJson.name}')).default;`,
    `$ = ${packageJson.name}.spellbook;`,
  ].join('');
}
const options: SpawnOptions = { stdio: ['pipe', 'inherit', 'inherit'] };
console.error(kurage.color.$.paint('magenta', replCode));

let commandArgs = {
  'bun': ['bun', 'repl'],
  'deno': ['deno', 'repl', '-A'],
  'node': ['node', '-i'],
}[kurage.runtime.name];
if (kurage.runtime.name === 'deno') {
  if (await kurage.$ok(['which', 'script'])) {
    commandArgs = ['script', '-qec', commandArgs.join(' '), '/dev/null'];
  } else {
    options.stdio = 'inherit';
  }
}

const command = kurage.command.new(commandArgs);
const exec = command.execAsync(options);
if (command.process != null && command.process.stdin != null) {
  command.process.stdin.write(`${replCode}\n`);
  process.stdin.pipe(command.process.stdin);
  process.stdin.setRawMode(true);
}
(await exec).exit();
