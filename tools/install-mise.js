#!/usr/bin/env node
const { kurage } = await import('kurage');
const { installCurl } = await import('./install-curl.js');
const { updateShellConfig } = await import('./shell-config.js');

export async function installMise() {
  const $ = kurage.spellbook;
  const home = process.env.HOME;
  let updatedPaths = [];
  if (!(await kurage.$ok(['mise', '--version']))) {
    if (!(await kurage.$ok(['curl', '--version']))) {
      await installCurl();
    }

    const installer = `/tmp/kurage-mise-install-${$.uuid()}.sh`;
    try {
      await kurage.$(['curl', '-fsSL', 'https://mise.run', '-o', installer]);
      await kurage.$(['sh', installer]);
    } finally {
      $.remove(installer);
    }

    updatedPaths = updateShellConfig(
      'eval "$(~/.local/bin/mise activate {shell})"'
    );
  }

  await kurage.$([`${home}/.local/bin/mise`, 'install']);

  for (const rcPath of updatedPaths) {
    kurage.logger.out(`Run: ${kurage.color.paint('cyan', `source ${rcPath}`)}`);
  }
}

if (kurage.isMain(import.meta.main, 'tools/install-mise.js')) {
  await installMise();
}
