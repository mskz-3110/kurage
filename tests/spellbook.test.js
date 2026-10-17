import { Spellbook } from '../dist/spellbook.js';
import fsModule from 'node:fs';
import osModule from 'node:os';
import pathModule from 'node:path';

describe('Spellbook', () => {
  const originalCwd = process.cwd();
  const dir = fsModule.mkdtempSync(
    pathModule.join(osModule.tmpdir(), 'spellbook-test-')
  );

  afterAll(() => {
    process.chdir(originalCwd);
    fsModule.rmSync(dir, { recursive: true, force: true });
  });

  describe('root', () => {
    it('gets & updates the root directory', () => {
      const root = Spellbook.root();
      expect(Spellbook.root(dir)).toBe(dir);
      expect(Spellbook.root()).toBe(dir);
      Spellbook.root(root);
    });

    it('defaults to cwd when INIT_CWD is undefined', async () => {
      const initCwd = process.env.INIT_CWD;
      try {
        delete process.env.INIT_CWD;
        vi.resetModules();
        const { Spellbook: isolatedSpellbook } = await import('../dist/spellbook.js');
        expect(isolatedSpellbook.root()).toBe(process.cwd());
      } finally {
        if (initCwd == null) {
          delete process.env.INIT_CWD;
        } else {
          process.env.INIT_CWD = initCwd;
        }
        vi.resetModules();
      }
    });
  });

  describe('chdirAsync', () => {
    it('changes directory during block & restores it', async () => {
      const cwd = process.cwd();
      const target = pathModule.join(dir, 'chdir');
      fsModule.mkdirSync(target);

      const result = await Spellbook.chdirAsync(target, async () => {
        expect(process.cwd()).toBe(target);
      });

      expect(result).toBe(target);
      expect(process.cwd()).toBe(cwd);
    });

    it('does not restore when the directory is unchanged', async () => {
      const cwd = process.cwd();
      expect(await Spellbook.chdirAsync(cwd)).toBe(cwd);
      expect(process.cwd()).toBe(cwd);
    });

    it('restores directory when block rejects', async () => {
      const cwd = process.cwd();
      await expect(
        Spellbook.chdirAsync(dir, async () => {
          throw new Error('block failed');
        })
      ).rejects.toThrow('block failed');
      expect(process.cwd()).toBe(cwd);
    });
  });

  describe('mkdirAsync', () => {
    it('creates a directory & runs from it', async () => {
      const target = pathModule.join(dir, 'mkdir');
      const created = await Spellbook.mkdirAsync(target);
      expect(created).toBe(target);
      expect(fsModule.statSync(target).isDirectory()).toBe(true);
    });
  });

  describe('tmpdirAsync', () => {
    it('runs from the temporary directory & restores cwd', async () => {
    const cwd = process.cwd();
    expect(await Spellbook.tmpdirAsync()).toBe(osModule.tmpdir());
    expect(process.cwd()).toBe(cwd);
    });
  });

  describe('uuid', () => {
    it('returns a UUID v4', () => {
      expect(Spellbook.uuid()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    });
  });

  describe('findIndex', () => {
    it('returns the first matching index from the requested position', () => {
      const values = ['a', 'b', 'c'];
      expect(Spellbook.findIndex(values, (value) => value === 'b')).toBe(1);
      expect(Spellbook.findIndex(values, (value) => value === 'a', 1)).toBe(-1);
      expect(Spellbook.findIndex(values, (value) => value === 'a', -1)).toBe(0);
      expect(Spellbook.findIndex(values, () => false)).toBe(-1);
    });
  });

  describe('sliceRange', () => {
    it('returns the selected range or its inverse', () => {
      const values = ['a', 'b', 'c', 'd', 'e'];
      expect(Spellbook.sliceRange(values, 0, 4)).toEqual(['b', 'c', 'd']);
      expect(Spellbook.sliceRange(values, 1, 3, true)).toEqual(['a', 'e']);
    });
  });

  describe('exists & absolute & relative & stat', () => {
    it('checks paths & resolves file metadata', () => {
      const file = pathModule.join(dir, 'exists.txt');
      fsModule.writeFileSync(file, 'value');

      expect(Spellbook.exists(file)).toBe(true);
      expect(Spellbook.exists(pathModule.join(dir, 'missing'))).toBe(false);
      expect(Spellbook.exists('')).toBe(true);
      expect(Spellbook.absolute('.')).toBe(process.cwd());
      expect(Spellbook.relative(file, dir)).toBe('exists.txt');
      expect(Spellbook.stat(file).isFile()).toBe(true);
      expect(Spellbook.stat(pathModule.join(dir, 'missing'))).toBeUndefined();
    });
  });

  describe('needsUpdate', () => {
    it('compares source & destination modification times', () => {
      const older = new Date(1000);
      const newer = new Date(2000);
      expect(Spellbook.needsUpdate({ mtime: newer }, undefined)).toBe(true);
      expect(Spellbook.needsUpdate({ mtime: newer }, { mtime: older })).toBe(true);
      expect(Spellbook.needsUpdate({ mtime: older }, { mtime: newer })).toBe(false);
      expect(Spellbook.needsUpdate({ mtime: older }, { mtime: older })).toBe(false);
    });
  });

  describe('copy & rename & remove', () => {
    it('copies, renames & removes files', () => {
      const source = pathModule.join(dir, 'source.txt');
      const copied = pathModule.join(dir, 'copied.txt');
      const renamed = pathModule.join(dir, 'renamed.txt');
      fsModule.writeFileSync(source, 'source');

      Spellbook.copy(source, copied);
      expect(Spellbook.read(copied)).toBe('source');
      Spellbook.rename(copied, renamed);
      expect(Spellbook.exists(copied)).toBe(false);
      expect(Spellbook.read(renamed)).toBe('source');

      Spellbook.remove(renamed);
      Spellbook.remove(renamed);
      expect(Spellbook.exists(renamed)).toBe(false);
    });
  });

  describe('glob', () => {
    it('returns matching directory entries', () => {
      fsModule.writeFileSync(pathModule.join(dir, 'glob-a.txt'), 'a');
      fsModule.writeFileSync(pathModule.join(dir, 'glob-b.md'), 'b');
      const entries = Spellbook.glob('glob-*.txt', { cwd: dir, withFileTypes: true });
      expect(entries.map((entry) => entry.name)).toEqual(['glob-a.txt']);
    });
  });

  describe('urlToPath', () => {
    it('converts a file URL to a path', () => {
      const file = pathModule.join(dir, 'url.txt');
      expect(Spellbook.urlToPath(new URL(`file://${file}`))).toBe(file);
    });
  });

  describe('path name helpers', () => {
    it('returns directory, file name & extension components', () => {
      const file = pathModule.join(dir, 'name.test.txt');
      expect(Spellbook.dirname(file)).toBe(dir);
      expect(Spellbook.filename(file)).toBe('name.test');
      expect(Spellbook.extname(file)).toBe('.txt');
      expect(Spellbook.basename(file)).toBe('name.test.txt');
    });
  });

  describe('write', () => {
    it('creates directories & appends text & writes bytes', () => {
      const file = pathModule.join(dir, 'nested', 'write.txt');
      Spellbook.write(file, 'first');
      Spellbook.write(file, 'second', true);
      expect(Spellbook.read(file)).toBe('first\nsecond\n');

      const binary = pathModule.join(dir, 'binary');
      Spellbook.write(binary, new Uint8Array([0, 1, 255]));
      expect(fsModule.readFileSync(binary)).toEqual(Buffer.from([0, 1, 255]));
    });

    it('closes the file when writing fails', () => {
      const writeSync = vi.spyOn(fsModule, 'fsyncSync').mockImplementation(() => {
        throw new Error('sync failed');
      });

      try {
        expect(() =>
          Spellbook.write(pathModule.join(dir, 'failed.txt'), 'value')
        ).toThrow('sync failed');
      } finally {
        writeSync.mockRestore();
      }
    });
  });

  describe('inspect', () => {
    it('supports objects with a null prototype', () => {
      expect(Spellbook.inspect(Object.create(null), { colors: false })).toBe(
        '{ properties: [], accessors: [], methods: [] }'
      );
    });

    it('reads members from the prototype when there are no own properties', () => {
      class Sample {
        method() {}
      }

      expect(Spellbook.inspect(new Sample(), { colors: false })).toBe(
        '{ properties: [], accessors: [], methods: [ \'method\' ] }'
      );
    });

    it('formats primitives, JSON values, classes & objects', () => {
      expect(Spellbook.inspect(null)).toBe('null');
      expect(Spellbook.inspect('text', { colors: false })).toBe("'text'");
      expect(
        Spellbook.inspect({ toJSON: () => ({ value: 1 }) }, { colors: false })
      ).toContain('value: 1');
      expect(Spellbook.inspect({ value: 1 }, { colors: false })).toBe(
        '{ properties: [ \'value\' ], accessors: [], methods: [] }'
      );
      expect(Spellbook.inspect(class Example {}, { colors: false })).toContain(
        '[class Example]'
      );
    });
  });

  describe('replace', () => {
    it('preserves an existing file with the temporary base name', () => {
      const dir = fsModule.mkdtempSync(
        pathModule.join(osModule.tmpdir(), 'spellbook-replace-')
      );
      const filePath = pathModule.join(dir, 'file.txt');
      const temporaryPath = pathModule.join(dir, '.file.txt');

      try {
        fsModule.writeFileSync(filePath, 'before');
        fsModule.writeFileSync(temporaryPath, 'keep');

        Spellbook.replace(filePath, 'after');

        expect(Spellbook.read(filePath)).toBe('after\n');
        expect(Spellbook.read(temporaryPath)).toBe('keep');
      } finally {
        fsModule.rmSync(dir, { recursive: true, force: true });
      }
    });
  });

  describe('readLinesAsync & readStreamLinesAsync', () => {
    it('reads lines from a file & a readable stream', async () => {
      const file = pathModule.join(dir, 'lines.txt');
      fsModule.writeFileSync(file, 'one\r\ntwo\n');
      expect(await Spellbook.readLinesAsync(file)).toEqual(['one', 'two']);

      const stream = fsModule.createReadStream(file);
      expect(await Spellbook.readStreamLinesAsync(stream)).toEqual(['one', 'two']);
    });
  });

  describe('assertEqual', () => {
    it('does not throw for equal values & reports unequal values', () => {
      expect(() => Spellbook.assertEqual('same', 'same')).not.toThrow();
      expect(() => Spellbook.assertEqual('left', 'right')).toThrow(
        '[\n  "left",\n  "right"\n]'
      );
      expect(() => Spellbook.assertEqual(1, 2, 'values differ')).toThrow(
        'values differ [\n  1,\n  2\n]'
      );
    });
  });

  describe('parseMemberNames', () => {
    it('lists class properties, accessors & methods', () => {
      class Sample {
        static property = 1;
        static method() {}
        value = 2;
        get accessor() {
          return this.value;
        }
        method() {}
      }

      expect(
        Spellbook.parseMemberNames(Sample, ['name', 'length', 'prototype'])
      ).toEqual({
        properties: ['property'],
        accessors: [],
        methods: ['method'],
      });
      const instance = new Sample();
      Object.defineProperty(instance, 'accessor', {
        get() {
          return this.value;
        },
      });
      expect(Spellbook.parseMemberNames(instance, ['constructor'])).toEqual({
        properties: ['value'],
        accessors: ['accessor'],
        methods: [],
      });
    });

    it('lists class-valued members as properties', () => {
      class Nested {}

      expect(Spellbook.parseMemberNames({ Nested }, [])).toEqual({
        properties: ['Nested'],
        accessors: [],
        methods: [],
      });
    });
  });

});
