type Node = {
  symbol: string;
  content: string;
  start: {
    index: number;
    format: string;
  };
  end: {
    index: number;
    format: string;
  };
  children: Node[];
};
export type Element = Omit<Node, 'children'>;
export declare class Parser {
  #private;
  static new(...args: ConstructorParameters<typeof Parser>): Parser;
  parse(lines: string[]): Element[];
  sanitize(line: string): string;
}
export type Marker = Omit<Element, 'symbol' | 'content'> & {
  lines: string[];
};
export declare class Replacer {
  #private;
  static new(...args: ConstructorParameters<typeof Replacer>): Replacer;
  addMarker(marker: Marker): void;
  replaceLines(lines: string[]): string[];
}
export declare class Transcluder {
  static get parser(): typeof Parser;
  static get replacer(): typeof Replacer;
  static new(...args: ConstructorParameters<typeof Transcluder>): Transcluder;
  transcludeLinesAsync(
    dir: string,
    lines: string[],
    encoding?: BufferEncoding
  ): Promise<string[]>;
  transcludeFileAsync(path: string, encoding?: BufferEncoding): Promise<boolean>;
}
export {};
