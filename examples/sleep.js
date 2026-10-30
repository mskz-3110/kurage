#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;
const { setTimeout } = await import('node:timers/promises');

await kurage.command.loggingActionAsync(
  [$.relative($.urlToPath(import.meta.url))],
  async () => {
    await setTimeout(kurage.duration.parse(kurage.process.args[0] ?? '0').ms);
  }
);
