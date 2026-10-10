import pathModule from 'node:path';
import { pathToFileURL } from 'node:url';
import kurage from '../kurage.js';

export async function runAsync() {
  if (0 < kurage.process.args.length) {
    const [path, ...args] = kurage.process.args;
    const absolutePath = pathModule.resolve(path!);
    Object.assign(globalThis, {
      kurage,
      $: kurage.spellbook,
    });
    await kurage.command.loggingActionAsync(
      [kurage.runtime.name, absolutePath, ...args],
      async () => {
        process.argv = [process.execPath, absolutePath, ...args];
        await import(pathToFileURL(absolutePath).href);
      }
    );
  }
}

if (import.meta.main) {
  await runAsync();
}
