import cryptoModule from 'node:crypto';
import fsModule from 'node:fs';
import osModule from 'node:os';
import pathModule from 'node:path';
import readlineModule from 'node:readline';
import urlModule from 'node:url';
import utilModule from 'node:util';
import { Color } from './color.js';
import { Path } from './path.js';

const ignoreStaticNames = ['length', 'name', 'prototype'];
const ignoreInstanceNames = ['constructor'];
var Spellbook = class Spellbook {
  static #root = process.env.INIT_CWD ?? process.cwd();
  static root(value) {
    if (value != null) Spellbook.#root = value;
    return Spellbook.#root;
  }
  static async chdirAsync(dir, block) {
    const oldDir = process.cwd();
    let newDir = dir;
    try {
      process.chdir(dir);
      newDir = process.cwd();
      await block?.();
    } finally {
      if (oldDir !== newDir) process.chdir(oldDir);
    }
    return newDir;
  }
  static async mkdirAsync(dir, block) {
    fsModule.mkdirSync(dir, { recursive: true });
    return await Spellbook.chdirAsync(dir, block);
  }
  static async tmpdirAsync(block) {
    return await Spellbook.chdirAsync(osModule.tmpdir(), block);
  }
  static randomBytes(size = 16) {
    return cryptoModule.randomBytes(size);
  }
  static exists(path) {
    return fsModule.existsSync(path);
  }
  static absolute(path) {
    return pathModule.resolve(path);
  }
  static relative(toPath, fromPath = process.cwd()) {
    return pathModule.relative(fromPath, toPath);
  }
  static stat(path) {
    return Spellbook.exists(path) ? fsModule.statSync(path) : void 0;
  }
  static needsUpdate(srcStats, dstStats) {
    if (dstStats == null) return true;
    return dstStats.mtime < srcStats.mtime;
  }
  static copy(srcPath, dstPath, options) {
    fsModule.cpSync(srcPath, dstPath, options);
  }
  static rename(oldPath, newPath) {
    fsModule.renameSync(oldPath, newPath);
  }
  static remove(path, options = {}) {
    if (Spellbook.exists(path))
      fsModule.rmSync(path, {
        recursive: true,
        force: true,
        ...options,
      });
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
  static write(path, data, options = { encoding: 'utf8' }) {
    fsModule.writeFileSync(path, data, options);
  }
  static append(path, data, options = { encoding: 'utf8' }) {
    fsModule.appendFileSync(path, data, options);
  }
  static replace(path, data) {
    const tmpPath = Path.with(path, { name: `.${Spellbook.filename(path)}` });
    let fd;
    try {
      fd = fsModule.openSync(tmpPath, 'w');
      fsModule.writeSync(fd, data);
      fsModule.fsyncSync(fd);
      fsModule.closeSync(fd);
      fd = void 0;
      fsModule.chmodSync(tmpPath, Spellbook.stat(tmpPath).mode);
      Spellbook.rename(tmpPath, path);
    } finally {
      if (fd != null) fsModule.closeSync(fd);
      Spellbook.remove(tmpPath);
    }
  }
  static read(path, encoding = 'utf8') {
    return fsModule.readFileSync(path, { encoding });
  }
  static async readLinesAsync(path, encoding = 'utf8') {
    const lines = [];
    for await (const line of readlineModule.createInterface({
      input: fsModule.createReadStream(pathModule.resolve(path), { encoding }),
      crlfDelay: Infinity,
    }))
      lines.push(line);
    return lines;
  }
  static assertEqual(value1, value2) {
    if (value1 !== value2) throw new Error(JSON.stringify([value1, value2], null, 2));
  }
  static analyzeClass(value, ignoreNames) {
    const target = typeof value === 'function' ? value : Object.getPrototypeOf(value);
    const propertyNames = Object.keys(target);
    const accessorNames = [];
    const methodNames = [];
    for (const propertyName of Object.getOwnPropertyNames(target)) {
      if (propertyNames.includes(propertyName) || ignoreNames.includes(propertyName))
        continue;
      const descriptor = Object.getOwnPropertyDescriptor(target, propertyName);
      if (typeof descriptor.get === 'function' || typeof descriptor.set === 'function') {
        accessorNames.push(propertyName);
        continue;
      }
      if (typeof Reflect.get(target, propertyName) === 'function')
        methodNames.push(propertyName);
    }
    return {
      propertyNames,
      accessorNames,
      methodNames,
    };
  }
  static inspect(
    value,
    options = {
      depth: null,
      colors: true,
      compact: false,
    }
  ) {
    if (value == null) return String(value);
    if (typeof value === 'function')
      return `${Color.$.paint('inspect-class', `[class ${value.name}]`, options.colors)} ${utilModule.inspect(Spellbook.analyzeClass(value, ignoreStaticNames), options)}`;
    if (typeof value === 'object') {
      if ('toJSON' in value && typeof value.toJSON === 'function')
        return utilModule.inspect(value.toJSON(), options);
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
};

export { Spellbook };
