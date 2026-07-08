import fsModule from 'node:fs';
import pathModule from 'node:path';
import urlModule from 'node:url';

var Spellbook = class Spellbook {
  static #root = process.env.INIT_CWD ?? process.cwd();
  static root(value) {
    if (value != null) Spellbook.#root = value;
    return Spellbook.#root;
  }
  static chdir(dir, block) {
    const cwd = process.cwd();
    const cleanup = () => {
      if (cwd !== process.cwd()) process.chdir(cwd);
    };
    try {
      process.chdir(dir);
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
  static mkdir(dir, block) {
    fsModule.mkdirSync(dir, { recursive: true });
    return Spellbook.chdir(dir, block);
  }
  static rmkdir(dir, block) {
    Spellbook.remove(dir);
    return Spellbook.mkdir(dir, block);
  }
  static glob(pattern, options) {
    return fsModule.globSync(pattern, options);
  }
  static urlToPath(url) {
    return urlModule.fileURLToPath(url);
  }
  static dirname(path) {
    return pathModule.parse(path).dir;
  }
  static filename(path) {
    return pathModule.parse(path).name;
  }
  static extname(path) {
    return pathModule.parse(path).ext;
  }
  static basename(path) {
    return pathModule.parse(path).base;
  }
};

export { Spellbook };
