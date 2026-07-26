import cryptoModule from 'node:crypto';
import type {
  CopySyncOptions,
  Dirent,
  GlobOptionsWithFileTypes,
  RmOptions,
  Stats,
} from 'node:fs';
import fsModule from 'node:fs';
import osModule from 'node:os';
import pathModule from 'node:path';
import readlineModule from 'node:readline';
import type { Readable } from 'node:stream';
import type { URL } from 'node:url';
import urlModule from 'node:url';
import type { InspectOptions } from 'node:util';
import utilModule from 'node:util';
import { Bytes } from './bytes.js';
import { Color } from './color.js';
import { Path } from './path.js';

export type DirBlock = () => Promise<void>;

export type ClassSummary = {
  propertyNames: string[];
  accessorNames: string[];
  methodNames: string[];
};

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

  static async chdirAsync(dir: string, block?: DirBlock): Promise<string> {
    const oldDir = process.cwd();
    let newDir = dir;
    try {
      process.chdir(dir);
      newDir = process.cwd();
      await block?.();
    } finally {
      if (oldDir !== newDir) {
        process.chdir(oldDir);
      }
    }
    return newDir;
  }

  static async mkdirAsync(dir: string, block?: DirBlock): Promise<string> {
    fsModule.mkdirSync(dir, {
      recursive: true,
    });
    return await Spellbook.chdirAsync(dir, block);
  }

  static async tmpdirAsync(block?: DirBlock): Promise<string> {
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

  static stat(path: string): Stats | undefined {
    return Spellbook.exists(path) ? fsModule.statSync(path) : undefined;
  }

  static needsUpdate(srcStats: Stats, dstStats: Stats | undefined): boolean {
    if (dstStats == null) {
      return true;
    }

    return dstStats.mtime < srcStats.mtime;
  }

  static copy(srcPath: string | URL, dstPath: string | URL, options?: CopySyncOptions) {
    fsModule.cpSync(srcPath, dstPath, options);
  }

  static rename(oldPath: string, newPath: string) {
    fsModule.renameSync(oldPath, newPath);
  }

  static remove(path: string, options: RmOptions = {}) {
    if (Spellbook.exists(path)) {
      fsModule.rmSync(path, {
        recursive: true,
        force: true,
        ...options,
      });
    }
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

  static write(path: string, data: string | Uint8Array, isSync: boolean = false) {
    let fd: number | undefined;
    try {
      fd = fsModule.openSync(path, 'a');
      fsModule.writeSync(fd, typeof data === 'string' ? Bytes.fromLines([data]) : data);
      if (isSync) {
        fsModule.fsyncSync(fd);
      }
      fsModule.closeSync(fd);
      fd = undefined;
    } finally {
      if (fd != null) {
        fsModule.closeSync(fd);
      }
    }
  }

  static replace(path: string, data: string | Uint8Array) {
    const tmpPath = Path.with(path, {
      name: `.${Spellbook.filename(path)}`,
    });
    try {
      Spellbook.remove(tmpPath);
      Spellbook.write(tmpPath, data, true);
      fsModule.chmodSync(tmpPath, Spellbook.stat(tmpPath)!.mode);
      Spellbook.rename(tmpPath, path);
    } finally {
      Spellbook.remove(tmpPath);
    }
  }

  static read(path: string, encoding: BufferEncoding = 'utf8'): string {
    return fsModule.readFileSync(path, { encoding });
  }

  static async readStreamLinesAsync(stream: Readable): Promise<string[]> {
    const lines = [];
    for await (const line of readlineModule.createInterface({
      input: stream,
      crlfDelay: Infinity,
    })) {
      lines.push(line);
    }
    return lines;
  }

  static async readLinesAsync(
    path: string,
    encoding: BufferEncoding = 'utf8'
  ): Promise<string[]> {
    return Spellbook.readStreamLinesAsync(
      fsModule.createReadStream(pathModule.resolve(path), { encoding })
    );
  }

  static assertEqual(value1: unknown, value2: unknown, message: string = '') {
    if (value1 !== value2) {
      throw new Error(
        `${message !== '' ? `${message} ` : ''}${JSON.stringify([value1, value2], null, 2)}`
      );
    }
  }

  static analyzeClass(value: unknown, ignoreNames: readonly string[]): ClassSummary {
    const propertyNames: string[] = [];
    const accessorNames: string[] = [];
    const methodNames: string[] = [];
    let descriptors = Object.entries(Object.getOwnPropertyDescriptors(value));
    if (descriptors.length === 0) {
      descriptors = Object.entries(
        Object.getOwnPropertyDescriptors(Object.getPrototypeOf(value))
      );
    }
    for (const [name, descriptor] of descriptors) {
      if (ignoreNames.includes(name)) {
        continue;
      }

      if (typeof descriptor.get === 'function' || typeof descriptor.set === 'function') {
        accessorNames.push(name);
        continue;
      }

      if (typeof descriptor.value === 'function') {
        if ((descriptor.value.toString() as string).startsWith('class ')) {
          propertyNames.push(name);
        } else {
          methodNames.push(name);
        }
        continue;
      }

      propertyNames.push(name);
    }
    return {
      propertyNames,
      accessorNames,
      methodNames,
    };
  }

  static inspect(
    value: unknown,
    options: InspectOptions = { depth: null, colors: true, compact: false }
  ): string {
    if (value == null) {
      return String(value);
    }

    if (typeof value === 'function') {
      return `${Color.$.paint('inspect-class', `[class ${value.name}]`, options.colors)} ${utilModule.inspect(
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

  static {
    Color.$.set('inspect-class', Color.$.get('cyan'));
  }
}
