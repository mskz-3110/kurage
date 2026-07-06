var Runtime = class Runtime {
  static #supportedRuntimes = {
    'bun': { replArgs: ['bun', 'repl'] },
    'deno': { replArgs: ['deno', 'repl', '-A'] },
    'node': { replArgs: ['node', '-i'] },
  };
  static #name = 'node';
  static get name() {
    return Runtime.#name;
  }
  static get names() {
    return Object.keys(Runtime.#supportedRuntimes);
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
