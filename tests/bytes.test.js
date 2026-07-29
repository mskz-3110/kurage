import { Bytes } from '../dist/bytes.js';

describe('Bytes', () => {
  it('toText & fromText', () => {
    [
      'text'
    ].forEach((text) => {
      expect(Bytes.toText(Bytes.fromText(text))).toBe(text);
    });
  });

  it('toText & fromLines', () => {
    [
      [''],
      ['a', 'b'],
      ['あいうえお', 'かきくけこ'],
    ].forEach((lines) => {
      const bytes = Bytes.fromLines(lines);
      expect(Bytes.toText(bytes)).toBe(lines.join('\n') + '\n');
    });

    const bytes = Bytes.fromLines(['a', 'b'], '\r\n');
    expect(Bytes.toText(bytes)).toBe('a\r\nb\r\n');
  });
});
