#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;

const scripts = $.glob(
  kurage.path.join([$.dirname($.urlToPath(import.meta.url)), '**', '*.js']),
  {
    exclude: (path) => path === 'check-scripts.js'
  }
);

let args = [];
for (const name of kurage.runtime.names) {
  args = name === 'deno' ? [name, '-A'] : [name];
  for (const script of scripts) {
    await kurage.$([...args, script]);
  }
}
