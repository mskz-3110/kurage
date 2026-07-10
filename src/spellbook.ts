import cryptoModule from 'node:crypto';
import type {
  CopySyncOptions,
  Dirent,
  GlobOptionsWithFileTypes,
  PathOrFileDescriptor,
  RmOptions,
  Stats,
  WriteFileOptions,
} from 'node:fs';
import fsModule from 'node:fs';
import osModule from 'node:os';
import pathModule from 'node:path';
import readlineModule from 'node:readline';
import type { URL } from 'node:url';
import urlModule from 'node:url';
import type { InspectOptions } from 'node:util';
import utilModule from 'node:util';
import { Color } from './color.js';

export type Block = (dir: string) => Promise<void>;

export interface ClassSummary {
  propertyNames: string[];
  accessorNames: string[];
  methodNames: string[];
}

const ignoreStaticNames: string[] = ['length', 'name', 'prototype'];
const ignoreInstanceNames: string[] = ['constructor'];

export class Spellbook {
  static #root: string = process.env.INIT_CWD ?? process.cwd();

  static root(value?: string): string {
    if (value != null) {
      Spellbook.#root = value;
    }
    return Spellbook.#root;
  }

  static async chdirAsync(dir: string, block?: Block): Promise<string> {
    const oldDir = process.cwd();
    let newDir = dir;
    try {
      process.chdir(dir);
      newDir = process.cwd();
      await block?.(newDir);
    } finally {
      if (oldDir !== newDir) {
        process.chdir(oldDir);
      }
    }
    return newDir;
  }

  static async mkdirAsync(dir: string, block?: Block): Promise<string> {
    fsModule.mkdirSync(dir, {
      recursive: true,
    });
    return await Spellbook.chdirAsync(dir, block);
  }

  static async tmpdirAsync(block?: Block): Promise<string> {
    return await Spellbook.chdirAsync(osModule.tmpdir(), block);
  }

  static randomBytes(size: number = 16): Buffer<ArrayBuffer> {
    return cryptoModule.randomBytes(size);
  }

  static exists(path: string): boolean {
    return fsModule.existsSync(path);
  }

  static absolute(path: string): string {
    return pathModule.resolve(path);
  }

  static relative(toPath: string, fromPath: string = process.cwd()): string {
    return pathModule.relative(fromPath, toPath);
  }

  static stat(path: string): Stats {
    return fsModule.statSync(path);
  }

  static copy(srcPath: string | URL, newPath: string | URL, options?: CopySyncOptions) {
    fsModule.cpSync(srcPath, newPath, options);
  }

  static move(oldPath: string, newPath: string) {
    fsModule.renameSync(oldPath, newPath);
  }

  static remove(path: string, options: RmOptions = {}) {
    fsModule.rmSync(path, {
      recursive: true,
      force: true,
      ...options,
    });
  }

  static glob(
    pattern: string | readonly string[],
    options: GlobOptionsWithFileTypes
  ): Dirent<string>[] {
    return fsModule.globSync(pattern, options);
  }

  static urlToPath(url: string | URL): string {
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

  static write(
    path: PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView,
    options: WriteFileOptions = { encoding: 'utf8' }
  ) {
    fsModule.writeFileSync(path, data, options);
  }

  static append(
    path: PathOrFileDescriptor,
    data: string | Uint8Array,
    options: WriteFileOptions = { encoding: 'utf8' }
  ) {
    fsModule.appendFileSync(path, data, options);
  }

  static read(
    path: PathOrFileDescriptor,
    encoding: BufferEncoding = 'utf8'
  ): string | Buffer<ArrayBuffer> {
    return fsModule.readFileSync(path, { encoding });
  }

  static async readlinesAsync(
    path: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<string[]> {
    const lines = [];
    for await (const line of readlineModule.createInterface({
      input: fsModule.createReadStream(pathModule.resolve(path), { encoding }),
      crlfDelay: Infinity,
    })) {
      lines.push(line);
    }
    return lines;
  }

  static assertEqual(value1: unknown, value2: unknown) {
    if (value1 !== value2) {
      throw new Error(JSON.stringify([value1, value2], null, 2));
    }
  }

  static analyzeClass(value: unknown, ignoreNames: readonly string[]): ClassSummary {
    const target = typeof value === 'function' ? value : Object.getPrototypeOf(value);
    const propertyNames: string[] = Object.keys(target);
    const accessorNames: string[] = [];
    const methodNames: string[] = [];
    for (const propertyName of Object.getOwnPropertyNames(target)) {
      if (propertyNames.includes(propertyName) || ignoreNames.includes(propertyName)) {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(target, propertyName);
      if (
        typeof descriptor!.get === 'function' ||
        typeof descriptor!.set === 'function'
      ) {
        accessorNames.push(propertyName);
        continue;
      }

      if (typeof Reflect.get(target, propertyName) === 'function') {
        methodNames.push(propertyName);
      }
    }

    return {
      propertyNames,
      accessorNames,
      methodNames,
    };
  }

  static inspect(
    value: unknown,
    options: InspectOptions = { depth: null, colors: false, compact: false }
  ): string {
    if (value == null) {
      return String(value);
    }

    if (typeof value === 'function') {
      return `${Color.$.paint('cyan', `[class ${value.name}]`, options.colors)} ${utilModule.inspect(
        Spellbook.analyzeClass(value, ignoreStaticNames),
        options
      )}`;
    }

    if (typeof value === 'object') {
      if ('toJSON' in value && typeof value.toJSON === 'function') {
        return utilModule.inspect(value.toJSON(), options);
      }

      return utilModule.inspect(
        Spellbook.analyzeClass(value, ignoreInstanceNames),
        options
      );
    }

    return utilModule.inspect(value, options);
  }
}
