import fsModule from 'node:fs';

var Path = class {
  static exists(path) {
    return fsModule.existsSync(path);
  }
};

export { Path };
