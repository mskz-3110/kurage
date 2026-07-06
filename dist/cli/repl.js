#!/usr/bin/env node
import kurage from '../kurage.js';

const command = kurage.command.new(kurage.runtime.config.replArgs);
const exec = command.execAsync({ stdio: ['pipe', 'inherit', 'inherit'] });
if (command.process != null && command.process.stdin != null) {
  command.process.stdin.write(`const {kurage} = await import('kurage');\n`);
  process.stdin.pipe(command.process.stdin);
  process.stdin.setRawMode(true);
}
(await exec).exit();
