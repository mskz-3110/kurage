#!/usr/bin/env node
import { start } from 'node:repl';
import kurage from '../kurage.js';

async function replAsync() {
  kurage.process.cleanup();
  await kurage.command.loggingActionAsync([kurage.runtime.name, 'repl'], async () => {
    const repl = start({ prompt: '> ' });
    const setReplContext = () => kurage.setupGlobals(repl.context);
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
if (import.meta.main) await replAsync();

export { replAsync };
