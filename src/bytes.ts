export class Bytes {
  static #eolBytes = new TextEncoder().encode('\n');

  static fromText(text: string): Uint8Array {
    return new TextEncoder().encode(text);
  }

  static fromLines(lines: string[]): Uint8Array {
    const encoder = new TextEncoder();
    const eolCount = 0 < lines.length ? lines.length - 1 : 0;
    let size = eolCount * Bytes.#eolBytes.length;
    for (const line of lines) {
      size += encoder.encode(line).length;
    }

    const bytes = new Uint8Array(size);
    let offset = 0;
    lines.forEach((line, index) => {
      const { written } = encoder.encodeInto(line, bytes.subarray(offset));
      offset += written;

      if (index < eolCount) {
        bytes.set(Bytes.#eolBytes, offset);
        offset += Bytes.#eolBytes.length;
      }
    });
    return bytes;
  }

  static toText(binary: Uint8Array): string {
    return new TextDecoder().decode(binary);
  }
}
