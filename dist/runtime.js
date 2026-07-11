const names = ['bun', 'deno', 'node'];
var Runtime = class Runtime {
  static #name = 'node';
  static get name() {
    return Runtime.#name;
  }
  static get names() {
    return names;
  }
  static supported(name) {
    return Object.hasOwn(process.versions, name);
  }
  static {
    for (const name of names)
      if (Object.hasOwn(process.versions, name)) {
        Runtime.#name = name;
        break;
      }
  }
};

export { Runtime };
