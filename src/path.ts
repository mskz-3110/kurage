import pathModule from 'node:path';

export type Split = (path: string) => string[];

export type Join = (paths: readonly string[]) => string;

export class Path {
  static split(
    path: string,
    split: Split = (path: string) => path.split(/[\\/]+/).filter(Boolean)
  ): string[] {
    return split(path);
  }

  static join(
    paths: readonly string[],
    join: Join = (paths: readonly string[]) => pathModule.join(...paths)
  ): string {
    return join(paths);
  }

  static rebuild(path: string, split: Split, join: Join): string {
    return join(split(path));
  }

  static with(
    path: string,
    args: Partial<{ dir: string; name: string; ext: string }>
  ): string {
    return pathModule.format({
      ...pathModule.parse(path),
      ...args,
      base: undefined,
    });
  }
}
