export type Matchers = Record<string, RegExp>;
export type Match = {
  index: number;
  name: string;
  text: string;
};
export declare class Scanner {
  #private;
  static new(...args: ConstructorParameters<typeof Scanner>): Scanner;
  constructor(matchers: Matchers);
  scan(index: number, line: string): Match | undefined;
  set(name: string, matcher: RegExp): Scanner;
}
export declare class Line {
  static eol: string;
  static get scanner(): typeof Scanner;
  static join(lines: string[], eol?: string): string;
  static split(text: string, eol?: string): string[];
}
