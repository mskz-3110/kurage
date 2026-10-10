const names = ['bun', 'node'] as const;

export type Name = (typeof names)[number];

export class Runtime {
  static #name: Name = 'node';

  static get name(): Name {
    return Runtime.#name;
  }

  static get names(): readonly Name[] {
    return names;
  }

  static supported(name: string): boolean {
    return Object.hasOwn(process.versions, name);
  }

  static #evalCode = `
globalThis.kurage = (await import('kurage')).default;
globalThis.$ = globalThis.kurage.spellbook;
`
    .trim()
    .split('\n')
    .join('');

  static get evalCode(): string {
    return Runtime.#evalCode;
  }

  static #replCode = `
${Runtime.#evalCode}
kurage.process.cleanup();
`
    .trim()
    .split('\n')
    .join('');

  static get replCode(): string {
    return Runtime.#replCode;
  }

  static #scriptCode = `
#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;
`.trim();

  static get scriptCode(): string {
    return Runtime.#scriptCode;
  }

  static {
    const runtimeName = (process.env.KURAGE_RUNTIME_NAME ?? '').toLowerCase();
    if ((names as unknown as string[]).includes(runtimeName)) {
      Runtime.#name = runtimeName as Name;
    } else {
      for (const name of names) {
        if (Object.hasOwn(process.versions, name)) {
          Runtime.#name = name;
          break;
        }
      }
    }
  }
}
