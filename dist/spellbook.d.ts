import type { Dirent, GlobOptionsWithFileTypes } from 'node:fs';
export type Block = () => void | Promise<void>;
export declare class Spellbook {
  #private;
  static root(value?: string): string;
  static chdir(dir: string, block?: Block): void | Promise<void>;
  static remove(path: string): void;
  static mkdir(dir: string, block?: Block): void | Promise<void>;
  static rmkdir(dir: string, block?: Block): void | Promise<void>;
  static glob(pattern: string, options: GlobOptionsWithFileTypes): Dirent<string>[];
  static urlToPath(url: string): string;
  static dirname(path: string): string;
  static filename(path: string): string;
  static extname(path: string): string;
  static basename(path: string): string;
}
