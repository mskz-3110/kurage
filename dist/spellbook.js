import fsModule from 'node:fs';

var Spellbook = class Spellbook {
  static chdir(directory, block) {
    const cwd = process.cwd();
    const cleanup = () => {
      if (cwd !== process.cwd()) process.chdir(cwd);
    };
    try {
      process.chdir(directory);
      const result = block?.();
      if (result instanceof Promise) return result.finally(cleanup);
      cleanup();
    } catch (e) {
      cleanup();
      throw e;
    }
  }
  static remove(path) {
    fsModule.rmSync(path, {
      recursive: true,
      force: true,
    });
  }
  static mkdir(directory, block) {
    fsModule.mkdirSync(directory, { recursive: true });
    return Spellbook.chdir(directory, block);
  }
  static rmkdir(directory, block) {
    Spellbook.remove(directory);
    return Spellbook.mkdir(directory, block);
  }
};

export { Spellbook };
