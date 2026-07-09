import cryptoModule from 'node:crypto';
import fsModule from 'node:fs';
import osModule from 'node:os';
import pathModule from 'node:path';
import readlineModule from 'node:readline';
import urlModule from 'node:url';

var Spellbook = class Spellbook {
  static #root = process.env.INIT_CWD ?? process.cwd();
  static root(value) {
    if (value != null) Spellbook.#root = value;
    return Spellbook.#root;
  }
  static tmpdir() {
    return osModule.tmpdir();
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
  static async chdirAsync(dir, block) {
    const cwd = process.cwd();
    try {
      process.chdir(dir);
      await block?.();
    } finally {
      if (cwd !== process.cwd()) process.chdir(cwd);
    }
  }
  static async mkdirAsync(dir, block) {
    fsModule.mkdirSync(dir, { recursive: true });
    return await Spellbook.chdirAsync(dir, block);
  }
  static stat(path) {
    return fsModule.statSync(path);
  }
  static copy(srcPath, newPath, options) {
    fsModule.cpSync(srcPath, newPath, options);
  }
  static move(oldPath, newPath) {
    fsModule.renameSync(oldPath, newPath);
  }
  static remove(path, options = {}) {
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
  static read(path, encoding = 'utf8') {
    return fsModule.readFileSync(path, { encoding });
  }
  static async readlinesAsync(path, encoding = 'utf8') {
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
};

export { Spellbook };
