#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;

const __FILE__ = $.urlToPath(import.meta.url);
const paths = 0 < kurage.process.args.length ? kurage.process.args : $.glob(kurage.path.join([$.dirname(__FILE__), 'vhs', '*.tape']));
for (const path of paths) {
  await kurage.$(['vhs', path]);
}
