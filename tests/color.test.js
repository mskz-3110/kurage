import { Color } from '../dist/color.js';

describe('Color', () => {
  it('enabled', () => {
    expect(typeof Color.enabled).toBe('boolean');
  });

  it('names', () => {
    expect(Color.$.names.length).toBeGreaterThan(0);
  });

  it('get', () => {
    expect(Color.$.get('red')).toBe('\u001b[31m');
    expect(Color.$.get('unknown')).toBe('');
  });

  it('set', () => {
    const color = Color.new();
    color.set('custom', 'value');
    expect(color.get('custom')).toBe('value');

    color.set('', '');
    expect(color.get('')).toBe('');
  });

  it('paint', () => {
    const hasColors = process.stdout.hasColors;
    process.stdout.hasColors = () => true;

    expect(Color.$.paint('red', 'text')).toBe('\u001b[31mtext\u001b[0m');
    expect(Color.$.paint('reset', 'text')).toBe('\u001b[0mtext');
    expect(Color.$.paint('red', '')).toBe('');
    expect(Color.$.paint('unknown', 'text')).toBe('text');

    process.stdout.hasColors = hasColors;
  });
});
