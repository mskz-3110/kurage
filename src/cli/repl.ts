import type { SpawnOptions } from 'node:child_process';
import kurage from '../kurage.js';

const packageJson = kurage.parsePackageJson();
const replCode = `
${packageJson.name} = (await import('${packageJson.name}')).default;
$ = ${packageJson.name}.spellbook;
`
  .trim()
  .split('\n')
  .join('');
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
