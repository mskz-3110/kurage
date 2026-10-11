#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;

const files = [
  ...$.glob(['dist/cli/*.js', 'examples/**/*.js', 'tools/*.js', 'tools/**/*.js']),
];
kurage.logger.out(JSON.stringify(files, null, 2));

await kurage.$(['chmod', '+x', ...files]);
await kurage.$(['git', 'update-index', '--chmod=+x', ...files]);
