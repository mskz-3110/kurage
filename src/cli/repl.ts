import kurage from '../kurage.js';

export async function replAsync() {
  const replCode = kurage.eval.replCode;
  console.error(kurage.color.$.paint('magenta', replCode));

  let commandArgs: string[] = [];
  const runtimeName = kurage.runtime.name;
  if (runtimeName === 'node') {
    if (kurage.runtime.supported('webcontainer')) {
      commandArgs = ['node', '-i'];
    } else {
      commandArgs = ['node', '-i', '-e', replCode];
    }
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
