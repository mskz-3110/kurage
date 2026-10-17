import { Path } from '../dist/path.js';

describe('Path', () => {
  it('split', () => {
    expect(Path.split('a/b')).toEqual(['a', 'b']);
  });

  it('join', () => {
    expect(Path.join(['a', 'b'])).toBe('a/b');
  });

  it('rebuild', () => {
    expect(
      Path.rebuild(
        'a/b',
        (path) => path.split('/'),
        (paths) => paths.join('\\')
      )
    ).toBe('a\\b');
  });

  it('with', () => {
    expect(Path.with('/tmp/file.md', { name: '.file' })).toBe('/tmp/.file.md');
    expect(Path.with('/tmp/file.md', { ext: '.txt' })).toBe('/tmp/file.txt');
  });
});
