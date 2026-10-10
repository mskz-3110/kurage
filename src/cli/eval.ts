import kurage from '../kurage.js';

export async function evalAsync() {
  const code = kurage.process.args.join('');
  Object.assign(globalThis, {
    kurage,
    $: kurage.spellbook,
  });
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
    code: string
  ) => () => Promise<void>;
  await kurage.command.loggingActionAsync([kurage.runtime.name, '-e', code], () =>
    new AsyncFunction(code)()
  );
}

if (import.meta.main) {
  await evalAsync();
}
