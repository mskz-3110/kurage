#!/usr/bin/env node
const { kurage } = await import('kurage');

const $ = kurage.spellbook;
const project = $.absolute(
  kurage.path.join([$.dirname($.urlToPath(import.meta.url)), '..'])
);

await $.chdirAsync(project, async () => {
  if ($.needsUpdate($.stat('README.ja.md'), $.stat('README.md'))) {
    kurage.process.abort('README.md needs to be updated from README.ja.md.');
  }
});

await kurage.$(['pnpm', 'audit', '--fix']);
