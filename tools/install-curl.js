#!/usr/bin/env node
const { kurage } = await import('kurage');

export async function installCurl() {
  if (await kurage.$ok(['curl', '--version'])) {
    return;
  }

  if (!(await kurage.$ok(['apt', '--version']))) {
    kurage.process.abort('apt is required.');
  }

  const sudo = process.getuid?.() === 0 ? [] : ['sudo'];
  if (sudo.length > 0 && !(await kurage.$ok([...sudo, '--version']))) {
    kurage.process.abort('sudo is required.');
  }

  await kurage.$([...sudo, 'apt', 'update']);
  await kurage.$([...sudo, 'apt', 'install', '-y', 'curl']);
}

if (kurage.isMain(import.meta.main, 'tools/install-curl.js')) {
  await installCurl();
}
