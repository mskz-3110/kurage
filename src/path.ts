import fsModule from 'node:fs';
import pathModule from 'node:path';

export type Split = (path: string) => string[];

export type Join = (paths: readonly string[]) => string;

export const defaultSplit = (path: string) => path.split(/[\\/]+/).filter(Boolean);

export const defaultJoin = (paths: readonly string[]) => pathModule.join(...paths);

export class Path {
  static exists(path: string): boolean {
    return fsModule.existsSync(path);
  }

  static absolute(path: string): string {
    return pathModule.resolve(path);
  }

  static relative(toPath: string, fromPath: string = process.cwd()): string {
    return pathModule.relative(fromPath, toPath);
  }

  static split(path: string, split: Split = defaultSplit): string[] {
    return split(path);
  }

  static join(paths: readonly string[], join: Join = defaultJoin): string {
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
