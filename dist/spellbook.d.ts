import type {
  CopySyncOptions,
  Dirent,
  GlobOptionsWithFileTypes,
  PathOrFileDescriptor,
  RmOptions,
  Stats,
  WriteFileOptions,
} from 'node:fs';
import type { URL } from 'node:url';
import type { InspectOptions } from 'node:util';
export type Block = () => Promise<void>;
export interface ClassSummary {
  propertyNames: string[];
  accessorNames: string[];
  methodNames: string[];
}
export declare class Spellbook {
  #private;
  static root(value?: string): string;
  static tmpdir(): string;
  static randomBytes(size?: number): Buffer<ArrayBuffer>;
  static exists(path: string): boolean;
  static absolute(path: string): string;
  static relative(toPath: string, fromPath?: string): string;
  static chdirAsync(dir: string, block?: Block): Promise<void>;
  static mkdirAsync(dir: string, block?: Block): Promise<void>;
  static stat(path: string): Stats;
  static copy(
    srcPath: string | URL,
    newPath: string | URL,
    options?: CopySyncOptions
  ): void;
  static move(oldPath: string, newPath: string): void;
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
  static write(
    path: PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView,
    options?: WriteFileOptions
  ): void;
  static append(
    path: PathOrFileDescriptor,
    data: string | Uint8Array,
    options?: WriteFileOptions
  ): void;
  static read(
    path: PathOrFileDescriptor,
    encoding?: BufferEncoding
  ): string | Buffer<ArrayBuffer>;
  static readlinesAsync(path: string, encoding?: BufferEncoding): Promise<string[]>;
  static assertEqual(value1: unknown, value2: unknown): void;
  static analyzeClass(value: unknown, ignoreNames: readonly string[]): ClassSummary;
  static inspect(value: unknown, options?: InspectOptions): string;
}
