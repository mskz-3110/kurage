import kurage from '../kurage.js';

export async function evalAsync() {
  const evalCode = [kurage.eval.code, ...kurage.process.args].join('');
  let commandArgs: string[] = [];
  const runtimeName = kurage.runtime.name;
  if (runtimeName === 'node') {
    commandArgs = ['node', '-e', evalCode];
  } else if (runtimeName === 'deno') {
    commandArgs = ['deno', 'eval', evalCode];
  } else if (runtimeName === 'bun') {
    commandArgs = ['bun', '-e', evalCode];
  }
  await kurage.$exit(commandArgs);
}

if (import.meta.main) {
  await evalAsync();
}
