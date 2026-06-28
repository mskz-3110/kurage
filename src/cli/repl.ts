import fsModule from 'node:fs';
import readlineModule from 'node:readline';
import replModule from 'node:repl';
import utilModule from 'node:util';
import type { Context } from 'node:vm';
import kurage from 'kurage';

const packageJson = kurage.parsePackageJson();
const kurageContext = {
  kurage,
};

const replServer = replModule.start({
  prompt: `${packageJson.name}> `, // TODO cyan
  writer: (data) => {
    if (data instanceof Error) {
      return data.toString(); // TODO red
    }

    return utilModule.inspect(data, { depth: null, colors: true });
  },
});

replServer.defineCommand('load', {
  help: replServer.commands.load!.help,
  action: async (filePath) => {
    replServer.clearBufferedCommand();
    try {
      const lines = [];
      for await (const line of readlineModule.createInterface({
        input: fsModule.createReadStream(filePath),
        crlfDelay: Infinity,
      })) {
        lines.push(line);
      }

      if (0 < lines.length) {
        if (lines[0]!.startsWith('#')) {
          lines.shift();
          if (lines.length === 0) {
            lines.push('');
          }
        }

        const lastIndex = lines.length - 1;
        lines[0] = `(async () => {${lines[0]}`;
        lines[lastIndex] = `${lines[lastIndex]}})();`;
      }

      replServer.eval(lines.join('\n'), replServer.context, filePath, async (error, result) => {
        await result;
        if (error) {
          console.error(error.stack);
        }
        replServer.displayPrompt();
      });
    } catch (e: unknown) {
      console.error(`${e instanceof Error ? e.message : String(e)} @ ${filePath}`);
      replServer.displayPrompt();
    }
  },
});

replServer.on('reset', (context: Context) => Object.assign(context, kurageContext));
replServer.emit('reset', replServer.context);
