declare const names: readonly ['bun', 'deno', 'node'];
export type Name = (typeof names)[number];
export declare class Runtime {
  #private;
  static get name(): Name;
  static get names(): readonly Name[];
}
export {};
