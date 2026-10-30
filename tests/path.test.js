import { Path } from '../dist/path.js';
import { Spellbook as $ } from '../dist/spellbook.js';

describe('Path', () => {
  it('splits a path into segments', () => {
    const path = $.relative($.absolute('a/b'));
    expect(Path.split(path)).toEqual(['a', 'b']);
  });

  it('joins path segments', () => {
    expect(Path.join(['a', 'b'])).toBe(
      $.relative($.absolute('a/b'))
    );
  });

  it('rebuilds a path with custom split & join functions', () => {
    expect(
      Path.rebuild(
        'a/b',
        (path) => path.split('/'),
        (paths) => paths.join('\\')
      )
    ).toBe('a\\b');
  });

  it('replaces selected path components', () => {
    const filePath = $.absolute('tmp/file.md');
    expect(Path.with(filePath, { name: '.file' })).toBe(
      $.absolute('tmp/.file.md')
    );
    expect(Path.with(filePath, { ext: '.txt' })).toBe(
      $.absolute('tmp/file.txt')
    );
  });
});
