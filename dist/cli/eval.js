#!/usr/bin/env node
import kurage from '../kurage.js';

async function evalAsync() {
  kurage.setupGlobals(globalThis);
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
  const code = kurage.line.join([...kurage.process.args]);
  await kurage.command.loggingActionAsync([kurage.runtimeName, '-e', code], () =>
    new AsyncFunction(code)()
  );
}
if (import.meta.main) await evalAsync();

export { evalAsync };
