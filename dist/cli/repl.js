#!/usr/bin/env node
import kurage from '../kurage.js';

const packageJson = kurage.parsePackageJson();
const replCode = [
  `const { ${packageJson.name} } = await import('${packageJson.name}');`,
  `const $ = ${packageJson.name}.spellbook;`,
].join('');
const options = { stdio: ['pipe', 'inherit', 'inherit'] };
console.error(kurage.color.$.paint('magenta', replCode));
let args = {
  'bun': ['bun', 'repl'],
  'deno': ['deno', 'repl', '-A'],
  'node': ['node', '-i'],
}[kurage.runtime.name];
if (kurage.runtime.name === 'deno')
  if (await kurage.$which('script'))
    args = ['script', '-qec', args.join(' '), '/dev/null'];
  else options.stdio = 'inherit';
const command = kurage.command.new(args);
const exec = command.execAsync(options);
if (command.process != null && command.process.stdin != null) {
  command.process.stdin.write(`${replCode}\n`);
  process.stdin.pipe(command.process.stdin);
  process.stdin.setRawMode(true);
}
(await exec).exit();
