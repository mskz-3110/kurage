#!/usr/bin/env node
import kurage from '../kurage.js';

const replCode = `const {kurage} = await import('kurage');`;
const options = { stdio: ['pipe', 'inherit', 'inherit'] };
let args = kurage.runtime.config.replArgs;
if (kurage.runtime.name === 'deno')
  if ((await kurage.$command(['which', 'script'], { stdio: 'ignore' }, {})).exitCode === 0)
    args = ['script', '-qec', args.join(' '), '/dev/null'];
  else options.stdio = 'inherit';
const command = kurage.command.new(args);
const exec = command.execAsync(options);
if (command.process != null && command.process.stdin != null) {
  command.process.stdin.write(`${replCode}\n`);
  process.stdin.pipe(command.process.stdin);
  process.stdin.setRawMode(true);
} else console.error(kurage.color.$.paint('cyan', replCode));
(await exec).exit();
