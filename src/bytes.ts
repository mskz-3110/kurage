import { Line } from './line.js';

export class Bytes {
  static fromText(text: string): Uint8Array {
    return new TextEncoder().encode(text);
  }

  static fromLines(lines: string[], eol: string = Line.eol): Uint8Array {
    const encoder = new TextEncoder();
    const eolBytes = encoder.encode(eol);
    let size = lines.length * eolBytes.length;
    for (const line of lines) {
      size += encoder.encode(line).length;
    }

    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const line of lines) {
      if (0 < line.length) {
        const { written } = encoder.encodeInto(line, bytes.subarray(offset));
        offset += written;
      }

      bytes.set(eolBytes, offset);
      offset += eolBytes.length;
    }
    return bytes;
  }

  static toText(binary: Uint8Array): string {
    return new TextDecoder().decode(binary);
  }
}
