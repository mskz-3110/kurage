const names = ['bun', 'node'];
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
  static #evalCode = `
globalThis.kurage = (await import('kurage')).default;
globalThis.$ = globalThis.kurage.spellbook;
`
    .trim()
    .split('\n')
    .join('');
  static get evalCode() {
    return Runtime.#evalCode;
  }
  static #replCode = `
${Runtime.#evalCode}
kurage.process.cleanup();
`
    .trim()
    .split('\n')
    .join('');
  static get replCode() {
    return Runtime.#replCode;
  }
  static #scriptCode = `
#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;
`.trim();
  static get scriptCode() {
    return Runtime.#scriptCode;
  }
  static {
    const runtimeName = (process.env.KURAGE_RUNTIME_NAME ?? '').toLowerCase();
    if (names.includes(runtimeName)) Runtime.#name = runtimeName;
    else
      for (const name of names)
        if (Object.hasOwn(process.versions, name)) {
          Runtime.#name = name;
          break;
        }
  }
};

export { Runtime };
