#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;

const packageName = kurage.packageJson.name;
let targets = kurage.process.args;
if (targets.length === 0) {
  targets = ['linux-x64', 'linux-arm64', 'windows-x64', 'darwin-arm64'];
}
await $.chdirAsync(
  kurage.path.join([$.dirname($.urlToPath(import.meta.url)), '..']),
  async () => {
    for (const target of targets) {
      const isWindows = target.includes('windows');
      const outputName = isWindows ? `${packageName}.exe` : packageName;
      const outputDir = `bin/${target}`;
      await $.mkdirAsync(outputDir);
      await kurage.$([
        'bun',
        'build',
        `src/cli/${packageName}.ts`,
        '--compile',
        '--compile-autoload-package-json',
        '--outfile',
        `${outputDir}/${outputName}`,
      ]);

      await $.chdirAsync(outputDir, async () => {
        let args = [];
        if (isWindows) {
          args = ['zip', `../${packageName}-${target}.zip`, outputName];
        } else {
          args = ['tar', '-czf', `../${packageName}-${target}.tar.gz`, outputName];
        }
        await kurage.$(args);
      });
    }
  }
);
