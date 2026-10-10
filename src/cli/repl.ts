import { start } from 'node:repl';
import kurage from '../kurage.js';

export async function replAsync() {
  kurage.process.cleanup();
  await kurage.command.loggingActionAsync([kurage.runtime.name, 'repl'], async () => {
    const repl = start({ prompt: '> ' });
    const setReplContext = () =>
      Object.assign(repl.context, { kurage, $: kurage.spellbook });
    setReplContext();
    const replWithResetContext = repl as typeof repl & {
      resetContext: () => void;
    };
    const resetContext = replWithResetContext.resetContext.bind(repl);
    replWithResetContext.resetContext = () => {
      resetContext();
      setReplContext();
    };
    await new Promise<void>((resolve) => repl.once('exit', resolve));
  });
}

if (import.meta.main) {
  await replAsync();
}
