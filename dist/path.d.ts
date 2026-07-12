export type Split = (path: string) => string[];
export type Join = (paths: readonly string[]) => string;
export declare class Path {
  static split(path: string, split?: Split): string[];
  static join(paths: readonly string[], join?: Join): string;
  static rebuild(path: string, split: Split, join: Join): string;
  static with(
    path: string,
    args: Partial<{
      dir: string;
      name: string;
      ext: string;
    }>
  ): string;
}
