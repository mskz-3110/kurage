export type RuntimeName = 'bun' | 'deno' | 'node';
export interface RuntimeConfig {
  readonly replArgs: string[];
}
export declare class Runtime {
  #private;
  static get name(): RuntimeName;
  static get config(): RuntimeConfig;
}
