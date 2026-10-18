#!/usr/bin/env node
const { kurage } = await import('kurage');

const $ = kurage.spellbook;

export async function uninstallMise() {
  const home = process.env.HOME ?? process.env.USERPROFILE ?? '';
  const isWindows = process.platform === 'win32';
  const rcPaths = [
    kurage.path.join([home, '.bashrc']),
    kurage.path.join([home, '.zshrc']),
  ];

  for (const rcPath of rcPaths) {
    if (!$.exists(rcPath)) continue;

    const lines = $.read(rcPath).split(/\r?\n/);
    const filteredLines = lines.filter(
      (line) =>
        !line.includes('mise activate') &&
        !(line.includes('cygpath') && line.includes('mise'))
    );
    if (filteredLines.length !== lines.length) {
      $.replace(rcPath, filteredLines.join('\n'));
    }
  }

  if (isWindows) {
    if (await kurage.$ok(['winget', '--version'])) {
      const result = await kurage.$command([
        'winget',
        'uninstall',
        '--id',
        'jdx.mise',
        '--exact',
        '--accept-source-agreements',
      ]);
      if (result.exitCode !== 0) result.exitIfFailure();
    }
  } else {
    $.remove(kurage.path.join([home, '.local', 'bin', 'mise']));
  }
}

if (kurage.isMain(import.meta.main, 'tools/uninstall-mise.js')) {
  await uninstallMise();
}
