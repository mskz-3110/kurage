export type Name = 'bun' | 'deno' | 'node';

export interface Config {
  readonly replArgs: string[];
}

export class Runtime {
  static #supportedRuntimes: Record<Name, Config> = {
    'bun': {
      replArgs: ['bun', 'repl'],
    },
    'deno': {
      replArgs: ['deno', 'repl'],
    },
    'node': {
      replArgs: ['node', '-i'],
    },
  } as const;

  static #name: Name = 'node';

  static get name(): Name {
    return Runtime.#name;
  }

  static get config(): Config {
    return Runtime.#supportedRuntimes[Runtime.#name];
  }

  static {
    for (const name of Object.keys(Runtime.#supportedRuntimes) as Name[]) {
      if (Object.hasOwn(process.versions, name)) {
        Runtime.#name = name;
        break;
      }
    }
  }
}
