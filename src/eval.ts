export class Eval {
  static #code = `
globalThis.kurage = (await import('kurage')).default;
globalThis.$ = globalThis.kurage.spellbook;
`
    .trim()
    .split('\n')
    .join('');

  static get code(): string {
    return Eval.#code;
  }

  static #replCode = `
${Eval.#code}
kurage.process.cleanup();
`
    .trim()
    .split('\n')
    .join('');

  static get replCode(): string {
    return Eval.#replCode;
  }
}
