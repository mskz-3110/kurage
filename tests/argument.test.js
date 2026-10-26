import { Argument } from '../dist/argument.js';
import { Logger } from '../dist/logger.js';
import { mockLoggerWrite, mockProcessExit } from './helpers.js';

afterEach(() => {
  vi.restoreAllMocks();
});

const withProcessMocks = (callback, exit = () => {}) => {
  const state = { exitCodes: mockProcessExit(exit), messages: [] };
  vi.spyOn(Logger, 'err').mockImplementation((message) => state.messages.push(message));
  mockLoggerWrite(state.messages, (_, message) => message);

  callback(state);
  return state;
};

describe('Argument', () => {
  describe('option', () => {
    it('uses default option values when no options are provided', () => {
      const argument = Argument.new('test')
        .option('-v, --verbose', 'Enable verbose output', false)
        .option('-c, --color <type>', 'Set color mode', 'auto')
        .parse([]);

      expect(argument.options.help).toBe(false);
      expect(argument.options.verbose).toBe(false);
      expect(argument.options.color).toBe('auto');
    });

    it('converts hyphenated names to camel case', () => {
      const argument = Argument.new('test')
        .requiredOption('--no-color <type>', 'Set color mode')
        .parse(['--no-color', 'always']);

      expect(argument.options.noColor).toBe('always');
    });

    it('replaces definitions with identical flags', () => {
      const argument = Argument.new('test')
        .option('--verbose', 'Old description', false)
        .option('--verbose', 'New description', true);

      expect(argument.help()).not.toContain('Old description');
      expect(argument.help()).toContain('New description');
      expect(argument.parse([]).options.verbose).toBe(true);
    });

    it('aborts when flags are empty', () => {
      withProcessMocks(() => {
        expect(() => Argument.new('test').option('', 'Invalid option', false)).toThrow(
          'process.exit'
        );
      }, () => {
        throw new Error('process.exit');
      });
    });
  });

  describe('parse', () => {
    it('accepts option aliases & values', () => {
      const argument = Argument.new('test')
        .option('-v, --verbose', 'Enable verbose output', false)
        .requiredOption('-c, --color <type>', 'Set color mode')
        .parse(['-v', '--color', 'always']);

      expect(argument.options.verbose).toBe(true);
      expect(argument.options.color).toBe('always');
    });

    it('collects repeated option values in an array', () => {
      const argument = Argument.new('test')
        .option('--value <value>', 'Input value', '')
        .parse(['--value', 'first', '--value', 'second', '--value', 'third']);

      expect(argument.options.value).toEqual(['first', 'second', 'third']);
    });

    it('accepts a required boolean option', () => {
      const argument = Argument.new('test')
        .requiredOption('-f, --force', 'Force operation')
        .parse(['--force']);

      expect(argument.options.force).toBe(true);
    });

    it('preserves positional arguments', () => {
      const args = ['command', 'first', 'second'];
      const argument = Argument.new('test').parse(args);

      expect(argument.args).toEqual(args);
    });

    it('preserves arguments after --', () => {
      const args = ['--not-an-option', 'value'];
      const argument = Argument.new('test').parse(['--', ...args]);

      expect(argument.args).toEqual(args);
    });

    it('resets options on each call', () => {
      const argument = Argument.new('test')
        .option('-v, --verbose', 'Enable verbose output', false)
        .parse(['--verbose'])
        .parse([]);

      expect(argument.options.verbose).toBe(false);
    });

    it('displays help & aborts when help is requested', () => {
      const { exitCodes, messages } = withProcessMocks(({ exitCodes, messages }) => {
        Argument.new('test').parse(['--help']);
        return { exitCodes, messages };
      });

      expect(exitCodes).toEqual([0]);
      expect(messages[0]).toContain('Usage: test [options]');
    });

    it('skips required option validation when help is requested', () => {
      const { messages } = withProcessMocks(({ messages }) => {
        expect(() =>
          Argument.new('test').requiredOption('--token <value>', 'Access token').parse(['--help'])
        ).toThrow('process.exit');
      }, () => {
        throw new Error('process.exit');
      });

      expect(messages[0]).toContain('--token <value>');
      expect(messages).toHaveLength(1);
    });

    it('aborts when a required option is missing', () => {
      const { exitCodes, messages } = withProcessMocks(({ exitCodes, messages }) => {
        expect(() => {
          Argument.new('test').requiredOption('--token <value>', 'Access token').parse([]);
        }).toThrow('process.exit');
        return { exitCodes, messages };
      }, () => {
        throw new Error('process.exit');
      });

      expect(exitCodes).toEqual([2]);
      expect(messages[1]).toContain('Missing required option: --token <value>');
    });

    it('aborts when an option value is missing', () => {
      const { exitCodes, messages } = withProcessMocks(({ exitCodes, messages }) => {
        expect(() => {
          Argument.new('test').requiredOption('--token <value>', 'Access token').parse(['--token']);
        }).toThrow('process.exit');
        return { exitCodes, messages };
      }, () => {
        throw new Error('process.exit');
      });

      expect(exitCodes).toEqual([2]);
      expect(messages[1]).toContain('Missing value: --token <value>');
    });

    it('aborts when an option value is not one of its choices', () => {
      const { exitCodes, messages } = withProcessMocks(({ exitCodes, messages }) => {
        expect(() => {
          Argument.new('test')
            .requiredOption('--value <value>', 'Input value', 'a', ['a', 'b'])
            .parse(['--value', 'c']);
        }).toThrow('process.exit');
        return { exitCodes, messages };
      }, () => {
        throw new Error('process.exit');
      });

      expect(exitCodes).toEqual([2]);
      expect(messages[1]).toContain('Invalid choice(--value <value>): c ["a","b"]');
    });

    it('aborts for an unknown option', () => {
      const { exitCodes, messages } = withProcessMocks(({ exitCodes, messages }) => {
        expect(() => {
          Argument.new('test').parse(['--unknown']);
        }).toThrow('process.exit');
        return { exitCodes, messages };
      }, () => {
        throw new Error('process.exit');
      });

      expect(exitCodes).toEqual([2]);
      expect(messages[1]).toContain('Unknown option: --unknown');
    });
  });

  describe('help', () => {
    it('formats usage, options, commands & examples', () => {
      const argument = Argument.new('test')
        .command('run <file>', 'Run a file')
        .option('-v, --verbose', 'Enable verbose output', false)
        .example('test run file.js');
      const help = argument.help();

      expect(help).toContain('Usage: test [options] [command]');
      expect(help).toContain('Options:');
      expect(help).toContain('-v, --verbose');
      expect(help).toContain('Commands:');
      expect(help).toContain('run <file>');
      expect(help).toContain('Examples:');
      expect(help).toContain('test run file.js');
      expect(help.indexOf('-h, --help')).toBeGreaterThan(help.indexOf('-v, --verbose'));
    });
  });
});
