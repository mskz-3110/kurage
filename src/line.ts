export type Matchers = Record<string, RegExp>;

export type Match = {
  index: number;
  name: string;
  text: string;
};

export class Scanner {
  static new(...args: ConstructorParameters<typeof Scanner>): Scanner {
    return new Scanner(...args);
  }

  static #normalizeMatcher(matcher: RegExp): RegExp {
    return new RegExp(matcher.source, matcher.flags.replace(/[gy]/g, ''));
  }

  #matchers: Matchers;

  constructor(matchers: Matchers) {
    this.#matchers = matchers;
  }

  scan(index: number, line: string): Match | undefined {
    for (const [name, matcher] of Object.entries(this.#matchers)) {
      const matches = Scanner.#normalizeMatcher(matcher).exec(line);
      if (matches != null) {
        return { index, name, text: matches[1] ?? matches[0] };
      }
    }
    return undefined;
  }

  set(name: string, matcher: RegExp): Scanner {
    this.#matchers[name] = matcher;
    return this;
  }
}

export class Line {
  static eol = '\n';

  static get scanner(): typeof Scanner {
    return Scanner;
  }

  static join(lines: string[], eol: string = Line.eol): string {
    return lines.join(eol);
  }

  static split(text: string, eol: string = Line.eol): string[] {
    return text === '' ? [] : text.split(eol);
  }
}
