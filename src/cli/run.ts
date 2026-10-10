import pathModule from 'node:path';
import { pathToFileURL } from 'node:url';
import kurage from '../kurage.js';

export async function runAsync() {
  if (0 < kurage.process.args.length) {
    const [path, ...args] = kurage.process.args;
    if (kurage.runtime.name === 'node') {
      await kurage.$exit(['node', path!, ...args]);
    } else {
      const absolutePath = pathModule.resolve(path!);
      await kurage.command.loggingActionAsync(
        ['bun', absolutePath, ...args],
        async () => {
          process.argv = [process.execPath, absolutePath, ...args];
          await import(pathToFileURL(absolutePath).href);
        }
      );
    }
  }
}

if (import.meta.main) {
  await runAsync();
}
