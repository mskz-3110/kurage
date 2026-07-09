import pathModule from 'node:path';

const defaultSplit = (path) => path.split(/[\\/]+/).filter(Boolean);
const defaultJoin = (paths) => pathModule.join(...paths);
var Path = class {
  static split(path, split = defaultSplit) {
    return split(path);
  }
  static join(paths, join = defaultJoin) {
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

export { defaultJoin, defaultSplit, Path };
