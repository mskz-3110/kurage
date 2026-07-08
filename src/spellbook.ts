import type { Dirent, GlobOptionsWithFileTypes } from 'node:fs';
import fsModule from 'node:fs';
import pathModule from 'node:path';
import urlModule from 'node:url';

export type Block = () => void | Promise<void>;

export class Spellbook {
  static #root: string = process.env.INIT_CWD ?? process.cwd();

  static root(value?: string): string {
    if (value != null) {
      Spellbook.#root = value;
    }
    return Spellbook.#root;
  }

  static chdir(dir: string, block?: Block): void | Promise<void> {
    const cwd = process.cwd();
    const cleanup = () => {
      if (cwd !== process.cwd()) {
        process.chdir(cwd);
      }
    };
    try {
      process.chdir(dir);
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

  static mkdir(dir: string, block?: Block): void | Promise<void> {
    fsModule.mkdirSync(dir, {
      recursive: true,
    });
    return Spellbook.chdir(dir, block);
  }

  static rmkdir(dir: string, block?: Block): void | Promise<void> {
    Spellbook.remove(dir);
    return Spellbook.mkdir(dir, block);
  }

  static glob(pattern: string, options: GlobOptionsWithFileTypes): Dirent<string>[] {
    return fsModule.globSync(pattern, options);
  }

  static urlToPath(url: string): string {
    return urlModule.fileURLToPath(url);
  }

  static dirname(path: string): string {
    return pathModule.parse(path).dir;
  }

  static filename(path: string): string {
    return pathModule.parse(path).name;
  }

  static extname(path: string): string {
    return pathModule.parse(path).ext;
  }

  static basename(path: string): string {
    return pathModule.parse(path).base;
  }
}
