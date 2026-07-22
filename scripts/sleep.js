#!/usr/bin/env node
const { kurage } = await import('kurage');
const { setTimeout } = await import('node:timers/promises');

await setTimeout(kurage.duration.parse(kurage.process.args[0] ?? '0').ms);
