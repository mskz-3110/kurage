#!/usr/bin/env node
import { start } from 'node:repl';
import kurage from '../kurage.js';

async function replAsync() {
  if (kurage.runtime.name === 'node')
    await kurage.$exit(['node', '-i', '-e', kurage.runtime.replCode]);
  else {
    kurage.process.cleanup();
    await kurage.command.loggingActionAsync(['bun', 'repl'], async () => {
      const repl = start({ prompt: '> ' });
      const setReplContext = () =>
        Object.assign(repl.context, {
          kurage,
          $: kurage.spellbook,
        });
      setReplContext();
      const replWithResetContext = repl;
      const resetContext = replWithResetContext.resetContext.bind(repl);
      replWithResetContext.resetContext = () => {
        resetContext();
        setReplContext();
      };
      await new Promise((resolve) => repl.once('exit', resolve));
    });
  }
}
if (import.meta.main) await replAsync();

export { replAsync };
