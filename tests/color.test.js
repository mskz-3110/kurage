import { Color } from '../dist/color.js';

const hasColors = process.stdout.hasColors;

afterEach(() => {
  process.stdout.hasColors = hasColors;
  Color.unset('custom');
});

describe('Color', () => {
  it('reports whether color output is enabled', () => {
    expect(typeof Color.enabled).toBe('boolean');
  });

  it('exposes registered color names', () => {
    expect(Color.names.length).toBeGreaterThan(0);
  });

  it('returns a color code or an empty string for an unknown name', () => {
    expect(Color.get('red')).toBe('\u001b[31m');
    expect(Color.get('unknown')).toBe('');
  });

  it('registers colors & ignores an empty name', () => {
    Color.set('custom', 'value');
    expect(Color.get('custom')).toBe('value');

    Color.set('', '');
    expect(Color.get('')).toBe('');
  });

  it('removes a registered color', () => {
    Color.set('custom', 'value');

    Color.unset('custom');

    expect(Color.get('custom')).toBe('');
    expect(Color.names).not.toContain('custom');
  });

  it('wraps messages with color codes when enabled', () => {
    process.stdout.hasColors = () => true;

    expect(Color.paint('red', 'text')).toBe('\u001b[31mtext\u001b[0m');
    expect(Color.paint('reset', 'text')).toBe('\u001b[0mtext');
    expect(Color.paint('red', '')).toBe('');
    expect(Color.paint('unknown', 'text')).toBe('text');
  });
});
