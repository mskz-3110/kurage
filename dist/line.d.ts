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
}
export declare class Line {
  static get scanner(): typeof Scanner;
  static join(lines: string[]): string;
  static split(text: string): string[];
}
