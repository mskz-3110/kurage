#!/usr/bin/env node
const { kurage } = await import('kurage');

const $ = kurage.spellbook;
const rcPaths = {
  bash: `${process.env.HOME}/.bashrc`,
  zsh: `${process.env.HOME}/.zshrc`,
};

export function updateShellConfig(text) {
  const updatedPaths = [];
  for (const [shell, rcPath] of Object.entries(rcPaths)) {
    if (!$.exists(rcPath)) continue;

    const rc = $.read(rcPath);
    const command = text.replaceAll('{shell}', shell);
    if (!rc.includes(command)) {
      $.write(rcPath, `${command}\n`, true);
      updatedPaths.push(rcPath.replace(process.env.HOME, '~'));
    }
  }
  return updatedPaths;
}
