import kurage from '../kurage.js';

export async function evalAsync() {
  const code = kurage.process.args.join('');
  if (kurage.runtime.name === 'node') {
    await kurage.$exit(['node', '-e', [kurage.runtime.evalCode, code].join('')]);
  } else {
    Object.assign(globalThis, {
      kurage,
      $: kurage.spellbook,
    });
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
      code: string
    ) => () => Promise<void>;
    await kurage.command.loggingActionAsync(['bun', '-e', code], () =>
      new AsyncFunction(code)()
    );
  }
}

if (import.meta.main) {
  await evalAsync();
}
