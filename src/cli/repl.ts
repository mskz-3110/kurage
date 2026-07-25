import type { SpawnOptions } from 'node:child_process';
import kurage from '../kurage.js';

export async function replAsync() {
  const packageName = kurage.packageJson.name;
  const replCode = kurage.line
    .split(
      `
  globalThis.${packageName} = (await import('${packageName}')).default;
  globalThis.$ = globalThis.${packageName}.spellbook;
  `.trim()
    )
    .join('');
  const options: SpawnOptions = {
    stdio: [kurage.runtime.name !== 'deno' ? 'pipe' : 'inherit', 'inherit', 'inherit'],
  };
  console.error(kurage.color.$.paint('magenta', replCode));

  const commandArgs = {
    'bun': ['bun', 'repl'],
    'deno': ['deno', 'repl', '-A'],
    'node': ['node', '-i'],
  }[kurage.runtime.name];
  const command = kurage.command.new(commandArgs);
  const exec = command.execAsync(options);
  if (
    command.process != null &&
    command.process.stdin != null &&
    kurage.runtime.name !== 'deno'
  ) {
    command.process.stdin.write(`${replCode}${kurage.line.eol}`);
    process.stdin.pipe(command.process.stdin);
    process.stdin.setRawMode(true);
  }
  (await exec).exit();
}

if (import.meta.main) {
  await replAsync();
}
