import kurage from '../kurage.js';

export async function replAsync() {
  const packageName = kurage.packageJson.name;
  const replCode = kurage.line
    .split(
      `
globalThis.${packageName} = (await import('${packageName}')).default;
globalThis.$ = globalThis.${packageName}.spellbook;
kurage.process.cleanup();
  `.trim()
    )
    .join('');
  console.error(kurage.color.$.paint('magenta', replCode));

  const runtimeName = kurage.process.args[0] ?? kurage.runtime.name;
  let commandArgs: string[] = [];
  if (runtimeName === 'node') {
    commandArgs = ['node', '-i', '-e', replCode];
  } else if (runtimeName === 'deno') {
    commandArgs = ['deno', 'repl', '-A', '--eval', replCode];
  } else if (runtimeName === 'bun') {
    commandArgs = ['bun', 'repl'];
  }
  await kurage.$exit(commandArgs);
}

if (import.meta.main) {
  await replAsync();
}
