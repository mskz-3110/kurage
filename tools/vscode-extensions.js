#!/usr/bin/env node
const { kurage } = await import('kurage');

const isWindows = process.platform === 'win32';
const extensions = [];

if (isWindows) {
  extensions.push('ms-vscode-remote.remote-wsl');
}

for (const extension of extensions) {
  kurage.logger.out(extension);
}
