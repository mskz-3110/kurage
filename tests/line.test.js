import { Line } from '../dist/line.js';

describe('Line', () => {
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

describe('Builder', () => {
  it('append & push & line', () => {
    const builder = Line.builder.new();
    builder.append('a').append('ignored', false).append('b').push();
    builder.line('ignored', false).line('c');

    expect(builder.text).toBe('');
    expect(builder.lines).toEqual(['ab', 'c']);
    expect(builder.toString()).toBe('ab\nc');
  });
});

describe('Scanner', () => {
  it('scan', () => {
    const scanner = Line.scanner.new({
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
