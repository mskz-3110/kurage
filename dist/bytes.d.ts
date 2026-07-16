export declare class Bytes {
  #private;
  static fromText(text: string): Uint8Array;
  static fromLines(lines: string[]): Uint8Array;
  static toText(binary: Uint8Array): string;
}
