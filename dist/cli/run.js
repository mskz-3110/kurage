#!/usr/bin/env node
import kurage from '../kurage.js';

async function runAsync() {
  if (0 < kurage.process.args.length)
    await kurage.$exit([kurage.runtime.name, ...kurage.process.args]);
}
if (import.meta.main) await runAsync();

export { runAsync };
