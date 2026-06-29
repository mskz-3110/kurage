var Runtime = class Runtime {
  static #supportedRuntimes = {
    'bun': { replArgs: ['bun', 'repl'] },
    'deno': { replArgs: ['deno', 'repl'] },
    'node': { replArgs: ['node', '-i'] },
  };
  static #name = 'node';
  static get name() {
    return Runtime.#name;
  }
  static get config() {
    return Runtime.#supportedRuntimes[Runtime.#name];
  }
  static {
    for (const name of Object.keys(Runtime.#supportedRuntimes))
      if (Object.hasOwn(process.versions, name)) {
        Runtime.#name = name;
        break;
      }
  }
};

export { Runtime };
