#!/usr/bin/env node
import kurage from '../kurage.js';

async function evalAsync() {
  const code = kurage.process.args.join('');
  if (kurage.runtime.name === 'node')
    await kurage.$exit(['node', '-e', [kurage.runtime.evalCode, code].join('')]);
  else {
    Object.assign(globalThis, {
      kurage,
      $: kurage.spellbook,
    });
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    await kurage.command.loggingActionAsync(['bun', '-e', code], () =>
      new AsyncFunction(code)()
    );
  }
}
if (import.meta.main) await evalAsync();

export { evalAsync };
