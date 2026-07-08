const names = ['bun', 'deno', 'node'] as const;

export type Name = (typeof names)[number];

export class Runtime {
  static #name: Name = 'node';

  static get name(): Name {
    return Runtime.#name;
  }

  static get names(): readonly Name[] {
    return names;
  }

  static {
    for (const name of names) {
      if (Object.hasOwn(process.versions, name)) {
        Runtime.#name = name;
        break;
      }
    }
  }
}
