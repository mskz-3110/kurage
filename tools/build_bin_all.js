#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;

const packageName = kurage.packageJson.name;
const targets = [
  'linux-x64',
  'linux-arm64',
  'windows-x64',
  'darwin-arm64',
];
await $.chdirAsync(kurage.path.join([$.dirname($.urlToPath(import.meta.url)), '..']), async () => {
  for (const target of targets) {
    await kurage.$(['bun', 'build', `src/cli/${packageName}.ts`, '--compile', '--compile-autoload-package-json', '--outfile', `bin/${packageName}-${target}`]);
  }
});
