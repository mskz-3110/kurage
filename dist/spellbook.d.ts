import type {
  CopySyncOptions,
  Dirent,
  GlobOptionsWithFileTypes,
  RmOptions,
  Stats,
  WriteFileOptions,
} from 'node:fs';
import type { URL } from 'node:url';
import type { InspectOptions } from 'node:util';
export type DirBlock = () => Promise<void>;
export type ClassSummary = {
  propertyNames: string[];
  accessorNames: string[];
  methodNames: string[];
};
export declare class Spellbook {
  #private;
  static root(value?: string): string;
  static chdirAsync(dir: string, block?: DirBlock): Promise<string>;
  static mkdirAsync(dir: string, block?: DirBlock): Promise<string>;
  static tmpdirAsync(block?: DirBlock): Promise<string>;
  static randomBytes(size?: number): Buffer<ArrayBuffer>;
  static exists(path: string): boolean;
  static absolute(path: string): string;
  static relative(toPath: string, fromPath?: string): string;
  static stat(path: string): Stats;
  static copy(
    srcPath: string | URL,
    newPath: string | URL,
    options?: CopySyncOptions
  ): void;
  static rename(oldPath: string, newPath: string): void;
  static remove(path: string, options?: RmOptions): void;
  static glob(
    pattern: string | readonly string[],
    options: GlobOptionsWithFileTypes
  ): Dirent<string>[];
  static urlToPath(url: string | URL): string;
  static dirname(path: string): string;
  static filename(path: string): string;
  static extname(path: string): string;
  static basename(path: string): string;
  static write(path: string, data: string | Uint8Array, options?: WriteFileOptions): void;
  static append(
    path: string,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): void;
  static replace(path: string, data: Uint8Array): void;
  static read(path: string, encoding?: BufferEncoding): string;
  static readLinesAsync(path: string, encoding?: BufferEncoding): Promise<string[]>;
  static assertEqual(value1: unknown, value2: unknown): void;
  static analyzeClass(value: unknown, ignoreNames: readonly string[]): ClassSummary;
  static inspect(value: unknown, options?: InspectOptions): string;
}
