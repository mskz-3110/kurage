import { Line, Scanner } from '../dist/line.js';

describe('Line', () => {
  it('scanner', () => {
    expect(Line.scanner != null).toBe(true);
  });

  it('split', () => {
    expect(Line.split('')).toEqual([]);
    expect(Line.split('a\nb')).toEqual(['a', 'b']);
  });

  it('split & join', () => {
    ['a\nb'].forEach((value) => {
      expect(Line.join(Line.split(value))).toBe(value);
    });
  });
});

describe('Scanner', () => {
  it('scan', () => {
    const scanner = Scanner.new({
      comment: /<!--\s*([\s\S]*\S)\s*-->/g,
    });

    expect(scanner.scan(3, '<!-- COMMENT -->')).toEqual({
      index: 3,
      name: 'comment',
      text: 'COMMENT',
    });

    expect(scanner.scan(3, 'TEXT')).toBeUndefined();
    scanner.set('text', /TEXT/);
    expect(scanner.scan(3, 'TEXT')).toEqual({
      index: 3,
      name: 'text',
      text: 'TEXT',
    });
  });
});
