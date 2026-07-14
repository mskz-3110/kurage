import pathModule from 'node:path';

var Path = class {
  static split(path, split = (path) => path.split(pathModule.sep).filter(Boolean)) {
    return split(path);
  }
  static join(paths, join = (paths) => pathModule.join(...paths)) {
    return join(paths);
  }
  static rebuild(path, split, join) {
    return join(split(path));
  }
  static with(path, args) {
    return pathModule.format({
      ...pathModule.parse(path),
      ...args,
      base: void 0,
    });
  }
};

export { Path };
