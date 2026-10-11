#!/usr/bin/env node
import kurage from '../kurage.js';

async function evalAsync() {
  const code = kurage.process.args.join('');
  kurage.setupGlobals(globalThis);
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
  await kurage.command.loggingActionAsync([kurage.runtimeName, '-e', code], () =>
    new AsyncFunction(code)()
  );
}
if (import.meta.main) await evalAsync();

export { evalAsync };
