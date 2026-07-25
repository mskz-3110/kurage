#!/usr/bin/env node
import kurage from '../kurage.js';

async function replAsync() {
  const packageName = kurage.packageJson.name;
  const replCode = kurage.line
    .split(
      `
globalThis.${packageName} = (await import('${packageName}')).default;
globalThis.$ = globalThis.${packageName}.spellbook;
kurage.process.cleanup();
  `.trim()
    )
    .join('');
  console.error(kurage.color.$.paint('magenta', replCode));
  const runtimeName = kurage.process.args[0] ?? kurage.runtime.name;
  let commandArgs = [];
  if (runtimeName === 'node')
    if (kurage.runtime.supported('webcontainer')) commandArgs = ['node', '-i'];
    else commandArgs = ['node', '-i', '-e', replCode];
  else if (runtimeName === 'deno')
    commandArgs = ['deno', 'repl', '-A', '--eval', replCode];
  else if (runtimeName === 'bun') commandArgs = ['bun', 'repl'];
  await kurage.$exit(commandArgs);
}
if (import.meta.main) await replAsync();

export { replAsync };
