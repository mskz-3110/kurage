import { Path } from '../dist/path.js';

describe('Path', () => {
  it('splits a path into segments', () => {
    expect(Path.split('a/b')).toEqual(['a', 'b']);
  });

  it('joins path segments', () => {
    expect(Path.join(['a', 'b'])).toBe('a/b');
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
    expect(Path.with('/tmp/file.md', { name: '.file' })).toBe('/tmp/.file.md');
    expect(Path.with('/tmp/file.md', { ext: '.txt' })).toBe('/tmp/file.txt');
  });
});
