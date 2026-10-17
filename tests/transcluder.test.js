import { Spellbook } from '../dist/spellbook.js';
import { Transcluder } from '../dist/transcluder.js';

const $ = Spellbook;

describe('Transcluder', () => {
  it('exposes Parser & Replacer', () => {
    expect(Transcluder.parser.new()).toBeInstanceOf(Transcluder.parser);
    expect(Transcluder.replacer.new()).toBeInstanceOf(Transcluder.replacer);
    expect(Transcluder.new()).toBeInstanceOf(Transcluder);
  });

  describe('equals', () => {
    it('returns true for equal lines', () => {
      expect(Transcluder.equals(['one', 'two'], ['one', 'two'])).toBe(true);
    });

    it('returns false for different lengths', () => {
      expect(Transcluder.equals(['one'], ['one', 'two'])).toBe(false);
    });

    it('returns false for different line content', () => {
      expect(Transcluder.equals(['one'], ['two'])).toBe(false);
    });
  });

  describe('Parser', () => {
    it('parses a marker with its content & formats', () => {
      const elements = Transcluder.parser.new().parse([
        'before',
        '<!-- :< file.txt { ``` -->',
        'content',
        '<!-- :} ``` -->',
      ]);

      expect(elements).toEqual([
        {
          symbol: '<',
          content: 'file.txt',
          start: { index: 1, format: ' ```' },
          end: { index: 3, format: ' ```' },
        },
      ]);
    });

    it('ignores unmatched closing markers & comments without an opening brace', () => {
      expect(
        Transcluder.parser.new().parse(['<!-- :} -->', '<!-- :not a marker -->', 'plain'])
      ).toEqual([]);
    });

    it('ignores children inside anonymous explanatory blocks', () => {
      const elements = Transcluder.parser.new().parse([
        '<!-- :{ -->',
        '<!-- :< file.txt { -->',
        '<!-- :} -->',
        '<!-- :} -->',
      ]);

      expect(elements).toEqual([]);
    });

    it('sanitizes directive comments but preserves ordinary text', () => {
      const parser = Transcluder.parser.new();

      expect(parser.sanitize('<!-- :< file.txt { -->')).toBe('');
      expect(parser.sanitize('ordinary text')).toBe('ordinary text');
    });
  });

  describe('Replacer', () => {
    it('replaces lines between a marker pair', () => {
      const replacer = Transcluder.replacer.new();
      replacer.addMarker({
        start: { index: 1, format: '' },
        end: { index: 3, format: '' },
        lines: ['included'],
      });

      expect(replacer.replaceLines(['before', 'start', 'old', 'end', 'after'])).toEqual([
        'before',
        'start',
        'included',
        'end',
        'after',
      ]);
    });

    it('inserts start & end formats around included lines', () => {
      const replacer = Transcluder.replacer.new();
      replacer.addMarker({
        start: { index: 1, format: '```text' },
        end: { index: 3, format: '```' },
        lines: ['included'],
      });

      expect(replacer.replaceLines(['before', 'start', 'old', 'end', 'after'])).toEqual([
        'before',
        'start',
        '```text',
        'included',
        '```',
        'end',
        'after',
      ]);
    });

    it('applies multiple markers from the end to preserve indexes', () => {
      const replacer = Transcluder.replacer.new();
      replacer.addMarker({
        start: { index: 1, format: '' },
        end: { index: 3, format: '' },
        lines: ['first'],
      });
      replacer.addMarker({
        start: { index: 5, format: '' },
        end: { index: 7, format: '' },
        lines: ['second'],
      });

      expect(
        replacer.replaceLines([
          'before',
          'start 1',
          'old 1',
          'end 1',
          'between',
          'start 2',
          'old 2',
          'end 2',
          'after',
        ])
      ).toEqual([
        'before',
        'start 1',
        'first',
        'end 1',
        'between',
        'start 2',
        'second',
        'end 2',
        'after',
      ]);
    });

    it('returns a copy when there are no markers', () => {
      const lines = ['one', 'two'];
      const replaced = Transcluder.replacer.new().replaceLines(lines);

      expect(replaced).toEqual(lines);
      expect(replaced).not.toBe(lines);
    });
  });

  describe('transcludeLinesAsync', () => {
    it('inserts file lines & sanitizes directive comments in included content', async () => {
      await $.tmpdirAsync(async () => {
        const dir = $.uuid();
        try {
          await $.mkdirAsync(dir, async () => {
            $.write(
              'include.txt',
              'first\n<!-- :{ -->\nsecond\n<!-- :} -->'
            );
            const lines = [
              'before',
              '<!-- :< include.txt { -->',
              'old content',
              '<!-- :} -->',
              'after',
            ];
            const replaced = await Transcluder.new().transcludeLinesAsync('.', lines);

            expect(replaced).toEqual([
              'before',
              '<!-- :< include.txt { -->',
              'first',
              '',
              'second',
              '',
              '<!-- :} -->',
              'after',
            ]);
          });
        } finally {
          $.remove(dir);
        }
      });
    });

    it('leaves lines unchanged when there is no include marker', async () => {
      await $.tmpdirAsync(async () => {
        const lines = ['plain', '<!-- :{ -->', 'example', '<!-- :} -->'];

        expect(await Transcluder.new().transcludeLinesAsync('.', lines)).toEqual(lines);
      });
    });

    it('ignores markers with symbols other than <', async () => {
      await $.tmpdirAsync(async () => {
        const lines = ['<!-- :> value { -->', '<!-- :} -->'];

        expect(await Transcluder.new().transcludeLinesAsync('.', lines)).toEqual(lines);
      });
    });

    it('rejects when the included file does not exist & restores cwd', async () => {
      await $.tmpdirAsync(async () => {
        const cwd = process.cwd();

        await expect(
          Transcluder.new().transcludeLinesAsync('.', [
            '<!-- :< missing.txt { -->',
            '<!-- :} -->',
          ])
        ).rejects.toThrow();

        expect(process.cwd()).toBe(cwd);
      });
    });
  });

  describe('transcludeFileAsync', () => {
    it('accepts a file name without a directory & skips unchanged files', async () => {
      await $.tmpdirAsync(async () => {
        const dir = $.uuid();
        try {
          await $.mkdirAsync(dir, async () => {
            $.write('source.md', 'content');
            const updated = await Transcluder.new().transcludeFileAsync('source.md');

            expect(updated).toBe(false);
            expect($.read('source.md')).toBe('content\n');
          });
        } finally {
          $.remove(dir);
        }
      });
    });

    it('writes the expanded content when a file changes', async () => {
      await $.tmpdirAsync(async () => {
        const dir = $.uuid();
        try {
          await $.mkdirAsync(dir, async () => {
            $.write('include.txt', 'included');
            $.write('source.md', '<!-- :< include.txt { -->\nold\n<!-- :} -->');
            const updated = await Transcluder.new().transcludeFileAsync('source.md');

            expect(updated).toBe(true);
            expect($.read('source.md')).toBe(
              '<!-- :< include.txt { -->\nincluded\n<!-- :} -->\n'
            );
          });
        } finally {
          $.remove(dir);
        }
      });
    });
  });
});
