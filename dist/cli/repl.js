#!/usr/bin/env node
import kurage from '../kurage.js';

async function replAsync() {
  const replCode = kurage.runtime.replCode;
  kurage.logger.err(kurage.color.paint('magenta', replCode));
  let commandArgs = ['node', '-i', '-e', replCode];
  if (kurage.runtime.name === 'bun') commandArgs = ['bun', 'repl'];
  await kurage.$exit(commandArgs);
}
if (import.meta.main) await replAsync();

export { replAsync };
