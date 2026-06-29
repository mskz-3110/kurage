export type RuntimeName = 'bun' | 'deno' | 'node';

export interface RuntimeConfig {
  readonly replArgs: string[];
}

export class Runtime {
  static #supportedRuntimes: Record<RuntimeName, RuntimeConfig> = {
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

  static #name: RuntimeName = 'node';

  static get name(): RuntimeName {
    return Runtime.#name;
  }

  static get config(): RuntimeConfig {
    return Runtime.#supportedRuntimes[Runtime.#name];
  }

  static {
    for (const name of Object.keys(Runtime.#supportedRuntimes) as RuntimeName[]) {
      if (Object.hasOwn(process.versions, name)) {
        Runtime.#name = name;
        break;
      }
    }
  }
}
