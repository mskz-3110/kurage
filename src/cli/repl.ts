import kurage from '../kurage.js';

export async function replAsync() {
  const replCode = kurage.runtime.replCode;
  console.error(kurage.color.paint('magenta', replCode));

  let commandArgs: string[] = ['node', '-i', '-e', replCode];
  const runtimeName = kurage.runtime.name;
  if (runtimeName === 'bun') {
    commandArgs = ['bun', 'repl'];
  }
  await kurage.$exit(commandArgs);
}

if (import.meta.main) {
  await replAsync();
}
