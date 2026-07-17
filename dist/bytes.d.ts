export declare class Bytes {
  static fromText(text: string): Uint8Array;
  static fromLines(lines: string[], eol?: string): Uint8Array;
  static toText(binary: Uint8Array): string;
}
