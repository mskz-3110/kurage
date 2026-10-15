#!/usr/bin/env node
const { kurage } = await import('kurage');

const isWsl = Boolean(process.env.WSL_DISTRO_NAME);
const isWindows = process.platform === 'win32';
const extensions = [];

if (!isWsl) {
  extensions.push('ms-vscode-remote.remote-containers');
}

if (isWindows) {
  extensions.push('ms-vscode-remote.remote-wsl');
}

for (const extension of extensions) {
  kurage.logger.out(extension);
}
