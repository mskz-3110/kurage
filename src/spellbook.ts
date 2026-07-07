import fsModule from 'node:fs';

export type Block = () => void | Promise<void>;

export class Spellbook {
  static chdir(directory: string, block?: Block): void | Promise<void> {
    const cwd = process.cwd();
    const cleanup = () => {
      if (cwd !== process.cwd()) {
        process.chdir(cwd);
      }
    };
    try {
      process.chdir(directory);
      const result = block?.();
      if (result instanceof Promise) {
        return result.finally(cleanup);
      }

      cleanup();
    } catch (e: unknown) {
      cleanup();
      throw e;
    }
  }

  static remove(path: string) {
    fsModule.rmSync(path, {
      recursive: true,
      force: true,
    });
  }

  static mkdir(directory: string, block?: Block): void | Promise<void> {
    fsModule.mkdirSync(directory, {
      recursive: true,
    });
    return Spellbook.chdir(directory, block);
  }

  static rmkdir(directory: string, block?: Block): void | Promise<void> {
    Spellbook.remove(directory);
    return Spellbook.mkdir(directory, block);
  }
}
