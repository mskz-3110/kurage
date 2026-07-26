var Eval = class Eval {
  static #code = `
globalThis.kurage = (await import('kurage')).default;
globalThis.$ = globalThis.kurage.spellbook;
`
    .trim()
    .split('\n')
    .join('');
  static get code() {
    return Eval.#code;
  }
  static #replCode = `
${Eval.#code}
kurage.process.cleanup();
`
    .trim()
    .split('\n')
    .join('');
  static get replCode() {
    return Eval.#replCode;
  }
};

export { Eval };
