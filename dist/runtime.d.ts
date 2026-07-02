export type Name = 'bun' | 'deno' | 'node';
export interface Config {
  readonly replArgs: string[];
}
export declare class Runtime {
  #private;
  static get name(): Name;
  static get config(): Config;
}
