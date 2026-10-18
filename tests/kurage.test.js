import kurage from '../dist/kurage.js';
import { mockProcessExit } from './helpers.js';

afterEach(() => {
  vi.restoreAllMocks();
});

const mockCommandOutput = (output) => {
  return vi.spyOn(kurage.command, 'new').mockImplementationOnce(() => ({
    execAsync: async (options) => {
      const stdout = options.stdio[1];
      Object.defineProperty(stdout, 'buffer', { value: Buffer.from(output) });
      stdout.end(output);
      return {
        exitIfFailure() {
          return this;
        },
      };
    },
  }));
};

describe('kurage', () => {
  describe('isMain', () => {
    it('returns true when import.meta.main is true', () => {
      expect(kurage.isMain(true, 'tools/dump-versions.js')).toBe(true);
    });

    it('matches the script path in argv when import.meta.main is false', () => {
      const argv = process.argv[1];
      process.argv[1] = kurage.spellbook.absolute('tools/dump-versions.js');
      try {
        expect(kurage.isMain(false, 'tools/dump-versions.js')).toBe(true);
      } finally {
        process.argv[1] = argv;
      }
    });

    it('returns false when neither main condition matches', () => {
      const argv = process.argv[1];
      process.argv[1] = kurage.spellbook.absolute('tools/dump-versions.js');
      try {
        expect(kurage.isMain(false, 'tools/install-mise.js')).toBe(false);
      } finally {
        process.argv[1] = argv;
      }
    });
  });

  it('adds kurage & spellbook globals to a target', () => {
    const target = {};

    kurage.setupGlobals(target);

    expect(target.kurage).toBe(kurage);
    expect(target.$).toBe(kurage.spellbook);
  });

  describe('$', () => {
    it('resolves when the command succeeds', async () => {
      await expect(kurage.$([process.execPath, '-e', ''])).resolves.toBeUndefined();
    });

    it('exits when the command fails', async () => {
      mockProcessExit((code) => {
        throw new Error(`exit:${code}`);
      });

      await expect(
        kurage.$([process.execPath, '-e', 'process.exit(3)'])
      ).rejects.toThrow('exit:3');
    });
  });

  describe('$command', () => {
    it('returns the command & forwards hooks', async () => {
      const events = [];
      const command = await kurage.$command(
        [process.execPath, '-e', ''],
        {},
        {
          onStart: (startedCommand) => {
            events.push(['start', startedCommand]);
            return 'context';
          },
          onEnd: (endedCommand, context) => events.push(['end', endedCommand, context]),
        }
      );

      expect(command.exitCode).toBe(0);
      expect(events).toEqual([
        ['start', command],
        ['end', command, 'context'],
      ]);
    });
  });

  describe('$exit', () => {
    it('exits with the command exit code', async () => {
      mockProcessExit((code) => {
        throw new Error(`exit:${code}`);
      });

      await expect(kurage.$exit([process.execPath, '-e', ''])).rejects.toThrow(
        'exit:0'
      );
    });
  });

  describe('$out', () => {
    it('returns trimmed stdout', async () => {
      mockCommandOutput('first\nsecond\n\n');
      await expect(kurage.$out(['command'])).resolves.toBe('first\nsecond');
    });

    it('uses the requested encoding', async () => {
      mockCommandOutput('text');
      await expect(kurage.$out(['command'], {}, 'base64')).resolves.toBe('dGV4dA==');
    });
  });

  describe('$ok', () => {
    it('returns true for a successful command', async () => {
      await expect(kurage.$ok([process.execPath, '-e', ''])).resolves.toBe(true);
    });

    it('returns false for a failed command', async () => {
      await expect(
        kurage.$ok([process.execPath, '-e', 'process.exit(4)'])
      ).resolves.toBe(false);
    });
  });

  describe('log', () => {
    it('forwards the logger name, argument & time', () => {
      const loggerWrite = vi.spyOn(kurage.logger, 'write').mockImplementation(() => {});
      const time = kurage.time.new();

      kurage.log('info', 'message', time);
      expect(loggerWrite).toHaveBeenCalledWith('info', 'message', time);
    });
  });

  describe('runtimeName', () => {
    it('detects the Bun runtime', async () => {
      const bunDescriptor = Object.getOwnPropertyDescriptor(process.versions, 'bun');
      try {
        Object.defineProperty(process.versions, 'bun', {
          configurable: true,
          value: 'test',
        });
        vi.resetModules();
        const { default: bunKurage } = await import('../dist/kurage.js');
        expect(bunKurage.runtimeName).toBe('bun');
      } finally {
        if (bunDescriptor == null) {
          delete process.versions.bun;
        } else {
          Object.defineProperty(process.versions, 'bun', bunDescriptor);
        }
        vi.resetModules();
      }
    });
  });

  it('exposes modules & runtime and package metadata', () => {
    expect(kurage.backtrace).toBeDefined();
    expect(kurage.argument).toBeDefined();
    expect(kurage.bytes).toBeDefined();
    expect(kurage.color).toBeDefined();
    expect(kurage.command).toBeDefined();
    expect(kurage.duration).toBeDefined();
    expect(kurage.exception).toBeDefined();
    expect(kurage.line).toBeDefined();
    expect(kurage.logger).toBeDefined();
    expect(kurage.path).toBeDefined();
    expect(kurage.process).toBeDefined();
    expect(kurage.spellbook).toBeDefined();
    expect(kurage.stopwatch).toBeDefined();
    expect(kurage.time).toBeDefined();
    expect(kurage.transcluder).toBeDefined();
    expect(['node', 'bun']).toContain(kurage.runtimeName);
    expect(kurage.packageJson).toMatchObject({
      name: 'kurage',
      version: expect.any(String),
      description: expect.any(String),
    });
  });
});
