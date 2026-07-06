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
      replArgs: ['deno', 'repl', '-A'],
    },
    'node': {
      replArgs: ['node', '-i'],
    },
  };

  static #name: Name = 'node';

  static get name(): Name {
    return Runtime.#name;
  }

  static get names(): string[] {
    return Object.keys(Runtime.#supportedRuntimes);
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
