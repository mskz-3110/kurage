import cryptoModule from 'node:crypto';
import fsModule from 'node:fs';
import osModule from 'node:os';
import pathModule from 'node:path';
import readlineModule from 'node:readline';
import urlModule from 'node:url';
import utilModule from 'node:util';
import { Bytes } from './bytes.js';
import { Color } from './color.js';
import { Path } from './path.js';

var DownloadError = class extends Error {
  url;
  status;
  constructor(url, status) {
    const urlString = String(url);
    super(
      JSON.stringify({
        status,
        url: urlString,
      })
    );
    this.name = 'DownloadError';
    this.url = urlString;
    this.status = status;
  }
};
const ignoreStaticNames = ['length', 'name', 'prototype'];
const ignoreInstanceNames = ['constructor'];
var Spellbook = class Spellbook {
  static #modeAllPermissions = 511;
  static #emptyBytes = /* @__PURE__ */ new Uint8Array();
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
      if (process.cwd() !== oldDir) process.chdir(oldDir);
    }
    return newDir;
  }
  static async mkdirAsync(dir, block) {
    fsModule.mkdirSync(dir, { recursive: true });
    return await Spellbook.chdirAsync(dir, block);
  }
  static async tmpdirAsync(block) {
    const dir = osModule.tmpdir();
    return block == null ? dir : await Spellbook.chdirAsync(dir, block);
  }
  static uuid() {
    return cryptoModule.randomUUID();
  }
  static findIndex(values, predicate, fromIndex = 0) {
    for (let index = Math.max(0, fromIndex); index < values.length; index += 1)
      if (predicate(values[index], index, values)) return index;
    return -1;
  }
  static squeezeBlankLines(lines) {
    const squeezedLines = lines.filter(
      (line, index) => line.trim() !== '' || (index > 0 && lines[index - 1].trim() !== '')
    );
    if (squeezedLines.at(-1)?.trim() === '') squeezedLines.pop();
    return squeezedLines;
  }
  static sliceRange(values, startIndex, endIndex, invert = false) {
    return invert
      ? [...values.slice(0, startIndex), ...values.slice(endIndex + 1)]
      : values.slice(startIndex + 1, endIndex);
  }
  static async extrangeAsync(lines, start, end, invert = false) {
    const startIndex = Spellbook.findIndex(lines, (line) => line === start);
    if (startIndex < 0) return invert ? lines : [];
    const endIndex = Spellbook.findIndex(lines, (line) => line === end, startIndex + 1);
    if (endIndex < 0) return invert ? lines : [];
    return Spellbook.sliceRange(lines, startIndex, endIndex, invert);
  }
  static exists(path) {
    return path === '' ? false : fsModule.existsSync(path);
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
    if (Spellbook.exists(newPath)) {
      const stats = Spellbook.stat(newPath);
      fsModule.chmodSync(oldPath, stats.mode & Spellbook.#modeAllPermissions);
      fsModule.chownSync(oldPath, stats.uid, stats.gid);
    }
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
  static write(path, data, isAppend = false) {
    let fd;
    try {
      const dir = Spellbook.dirname(path);
      if (dir !== '' && !Spellbook.exists(dir))
        fsModule.mkdirSync(dir, { recursive: true });
      fd = fsModule.openSync(path, isAppend ? 'a' : 'w');
      fsModule.writeSync(fd, typeof data === 'string' ? Bytes.fromLines([data]) : data);
      fsModule.fsyncSync(fd);
      fsModule.closeSync(fd);
      fd = void 0;
    } finally {
      if (fd != null) fsModule.closeSync(fd);
    }
  }
  static append(path, data) {
    Spellbook.write(path, data, true);
  }
  static replace(path, data) {
    const tmpPath = Path.with(path, {
      name: `.${Spellbook.filename(path)}.${Spellbook.uuid()}`,
    });
    try {
      Spellbook.write(tmpPath, data);
      Spellbook.rename(tmpPath, path);
    } finally {
      Spellbook.remove(tmpPath);
    }
  }
  static read(path, encoding = 'utf8') {
    return fsModule.readFileSync(path, { encoding });
  }
  static async readStreamLinesAsync(stream) {
    const lines = [];
    for await (const line of readlineModule.createInterface({
      input: stream,
      crlfDelay: Infinity,
    }))
      lines.push(line);
    return lines;
  }
  static async readLinesAsync(path, encoding = 'utf8') {
    return Spellbook.readStreamLinesAsync(
      fsModule.createReadStream(pathModule.resolve(path), { encoding })
    );
  }
  static async downloadAsync(url, path) {
    const response = await fetch(url);
    if (!response.ok) throw new DownloadError(url, response.status);
    Spellbook.write(path, Spellbook.#emptyBytes);
    if (response.body != null)
      for await (const chunk of response.body) Spellbook.append(path, chunk);
    return path;
  }
  static assertEqual(value1, value2, message = '') {
    if (value1 !== value2)
      throw new Error(
        `${message !== '' ? `${message} ` : ''}${JSON.stringify([value1, value2], null, 2)}`
      );
  }
  static parseMemberNames(value, ignoreNames) {
    const properties = [];
    const accessors = [];
    const methods = [];
    let descriptors = Object.entries(Object.getOwnPropertyDescriptors(value));
    const prototype = Object.getPrototypeOf(value);
    if (descriptors.length === 0 && prototype != null)
      descriptors = Object.entries(Object.getOwnPropertyDescriptors(prototype));
    for (const [name, descriptor] of descriptors) {
      if (ignoreNames.includes(name)) continue;
      if (typeof descriptor.get === 'function' || typeof descriptor.set === 'function') {
        accessors.push(name);
        continue;
      }
      if (typeof descriptor.value === 'function') {
        if (descriptor.value.toString().startsWith('class ')) properties.push(name);
        else methods.push(name);
        continue;
      }
      properties.push(name);
    }
    return {
      properties,
      accessors,
      methods,
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
      return `${Color.paint('inspect-class', `[class ${value.name}]`, options.colors)} ${utilModule.inspect(Spellbook.parseMemberNames(value, ignoreStaticNames), options)}`;
    if (typeof value === 'object') {
      if ('toJSON' in value && typeof value.toJSON === 'function')
        return utilModule.inspect(value.toJSON(), options);
      return utilModule.inspect(
        Spellbook.parseMemberNames(value, ignoreInstanceNames),
        options
      );
    }
    return utilModule.inspect(value, options);
  }
  static {
    Color.set('inspect-class', Color.get('cyan'));
  }
};

export { DownloadError, Spellbook };
