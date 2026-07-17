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

  #matchers: Matchers;

  constructor(matchers: Matchers) {
    this.#matchers = matchers;
  }

  scan(index: number, line: string): Match | undefined {
    for (const [name, matcher] of Object.entries(this.#matchers)) {
      const matches = line.match(matcher);
      if (matches != null) {
        return { index, name, text: matches[1] ?? matches[0] };
      }
    }
    return undefined;
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
    return text.split(eol);
  }
}
