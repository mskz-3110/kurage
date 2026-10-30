import { Line } from '../dist/line.js';

describe('Line', () => {
  it('splits text into lines & treats empty text as no lines', () => {
    expect(Line.split('')).toEqual([]);
    expect(Line.split('a\nb')).toEqual(['a', 'b']);
  });

  it('round-trips text through split & join', () => {
    ['a\nb'].forEach((value) => {
      expect(Line.join(Line.split(value))).toBe(value);
    });
  });
});

describe('Builder', () => {
  it('appends text & pushes and conditionally adds lines', () => {
    const builder = Line.builder.new();
    builder.append('a').append('ignored', false).append('b').push();
    builder.line('ignored', false).line('c');

    expect(builder.text).toBe('');
    expect(builder.lines).toEqual(['ab', 'c']);
    expect(builder.toString()).toBe('ab\nc');
  });
});

describe('Scanner', () => {
  it('returns the first matching scanner rule', () => {
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
