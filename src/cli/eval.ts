import kurage from '../kurage.js';

export async function evalAsync() {
  kurage.setupGlobals(globalThis);
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (
    code: string
  ) => () => Promise<void>;
  const code = kurage.line.join([...kurage.process.args]);
  await kurage.command.loggingActionAsync([kurage.runtimeName, '-e', code], () =>
    new AsyncFunction(code)()
  );
}

if (import.meta.main) {
  await evalAsync();
}
