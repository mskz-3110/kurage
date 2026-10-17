import { Command } from '../dist/command.js';
import { Logger } from '../dist/logger.js';

const unavailableCommand = 'kurage-command-that-does-not-exist';

describe('Command', () => {
  describe('new', () => {
    it('copies args & formats the command', () => {
      const args = ['node', 'script.js'];
      const command = Command.new(args);
      args.push('changed');

      expect(command.args).toEqual(['node', 'script.js']);
      expect(command.toString()).toBe('node |args|=2');
      expect(command.process).toBeUndefined();
      expect(command.exception).toBeUndefined();
      expect(command.exitCode).toBe(0);
    });

    it('formats an empty command', () => {
      const command = Command.new([]);

      expect(command.args).toEqual([]);
      expect(command.toString()).toBe('');
    });
  });

  describe('stream', () => {
    it('exposes Stream & buffers written data', async () => {
      const stream = Command.stream.new();
      stream.end('first');
      await new Promise((resolve) => stream.on('close', resolve));

      expect(stream.buffer.toString()).toBe('first');
    });
  });

  describe('mergeStdio', () => {
    it('uses default stdio when none is specified', () => {
      const options = {};
      const merged = Command.mergeStdio(options, ['ignore', null, 'pipe'], 'inherit');

      expect(merged).toEqual({ stdio: 'inherit' });
      expect(options).toEqual({});
    });

    it('expands a stdio string & applies overrides', () => {
      expect(
        Command.mergeStdio({ stdio: 'inherit' }, ['ignore', null, 'pipe'], 'pipe')
      ).toEqual({ stdio: ['ignore', 'inherit', 'pipe'] });
    });

    it('preserves array stdio entries without overrides', () => {
      const stdio = ['ignore', 'pipe'];
      const merged = Command.mergeStdio({ stdio }, [null, null, null], 'inherit');

      expect(merged.stdio).toEqual(stdio);
      expect(merged.stdio).not.toBe(stdio);
    });

    it('ignores a non-array override', () => {
      expect(Command.mergeStdio({ stdio: 'pipe' }, 'inherit', 'ignore')).toEqual({
        stdio: ['pipe', 'pipe', 'pipe'],
      });
    });
  });

  describe('execAsync', () => {
    it('uses the default logging hooks', async () => {
      const loggerWrite = Logger.write;
      const names = [];
      Logger.write = (name) => names.push(name);

      try {
        await Command.new([]).execAsync();
      } finally {
        Logger.write = loggerWrite;
      }

      expect(names).toEqual(['command-start', 'command-end']);
    });

    it('executes a command & passes hook context', async () => {
      const hooks = [];
      const command = await Command.new([process.execPath, '-e', ''])
        .execAsync({}, {
          onStart: (current) => {
            hooks.push(['start', current]);
            return 'context';
          },
          onEnd: (current, context) => hooks.push(['end', current, context]),
        });

      expect(command.process).toBeDefined();
      expect(command.exitCode).toBe(0);
      expect(command.exception).toBeUndefined();
      expect(command.stopwatch.stopTime).toBeDefined();
      expect(hooks).toEqual([
        ['start', command],
        ['end', command, 'context'],
      ]);
    });

    it('connects Stream instances to child stdio', async () => {
      const stdout = Command.stream.new();
      const stderr = Command.stream.new();
      const streamsClosed = Promise.all(
        [stdout, stderr].map((stream) => new Promise((resolve) => stream.once('close', resolve)))
      );
      const command = await Command.new([
        process.execPath,
        '-e',
        "process.stdout.write('out'); process.stderr.write('err')",
      ]).execAsync({ stdio: ['ignore', stdout, stderr] }, {});
      await streamsClosed;

      expect(command.exitCode).toBe(0);
      expect(stdout.writableFinished).toBe(true);
      expect(stderr.writableFinished).toBe(true);
    });

    it('connects stdout-only & stderr-only Stream instances', async () => {
      const stdout = Command.stream.new();
      const stderr = Command.stream.new();
      const stdoutClosed = new Promise((resolve) => stdout.once('close', resolve));
      const stderrClosed = new Promise((resolve) => stderr.once('close', resolve));
      const stdoutCommand = await Command.new([process.execPath, '-e', '']).execAsync(
        { stdio: ['ignore', stdout, 'inherit'] },
        {}
      );
      const stderrCommand = await Command.new([process.execPath, '-e', '']).execAsync(
        { stdio: ['ignore', 'inherit', stderr] },
        {}
      );
      await Promise.all([stdoutClosed, stderrClosed]);

      expect(stdoutCommand.exitCode).toBe(0);
      expect(stderrCommand.exitCode).toBe(0);
      expect(stdout.writableFinished).toBe(true);
      expect(stderr.writableFinished).toBe(true);
    });

    it('returns a failing exit code without an exception', async () => {
      const command = await Command.new([process.execPath, '-e', 'process.exit(7)']).execAsync(
        {},
        {}
      );

      expect(command.exitCode).toBe(7);
      expect(command.exception).toBeUndefined();
    });

    it('records a spawn error', async () => {
      const command = await Command.new([unavailableCommand]).execAsync({}, {});

      expect(command.exception.error.message).toContain(unavailableCommand);
      expect(command.exception.error.stack).toContain(command.toString());
    });

    it('records signal termination', async () => {
      const command = await Command.new([
        process.execPath,
        '-e',
        "process.kill(process.pid, 'SIGTERM')",
      ]).execAsync({}, {});

      expect(command.exception.error.message).toContain('SignalException: SIGTERM');
      expect(command.exception.error.stack).toBe(command.exception.error.message);
    });

    it('cleans up when onStart throws', async () => {
      const signals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT', 'SIGBREAK'];
      const listenerCounts = signals.map((signal) => process.listeners(signal).length);
      const command = await Command.new(['test']).execAsync({}, {
        onStart: () => {
          throw new Error('start failed');
        },
      });

      expect(signals.map((signal) => process.listeners(signal).length)).toEqual(listenerCounts);
      expect(command.exception.error.message).toContain('start failed');
      expect(command.stopwatch.stopTime).toBeDefined();
    });

    it('uses the command string for an empty exception message', async () => {
      const command = await Command.new(['test']).execAsync({}, {
        onStart: () => {
          throw new Error('');
        },
      });

      expect(command.exception.error.message).toBe(command.toString());
    });

    it('supports an empty command', async () => {
      const hooks = [];
      const command = await Command.new([]).execAsync({}, {
        onStart: () => 'empty',
        onEnd: (_, context) => hooks.push(context),
      });

      expect(command.process).toBeUndefined();
      expect(command.exitCode).toBe(1);
      expect(hooks).toEqual(['empty']);
    });
  });

  describe('kill', () => {
    it('kills a running child process', async () => {
      const command = Command.new([process.execPath, '-e', 'setInterval(() => {}, 1000)']);
      const execution = command.execAsync({}, {});
      while (command.process == null) {
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
      command.kill('SIGTERM');
      await execution;

      expect(command.exception.error.message).toContain('SignalException: SIGTERM');
    });

    it('does nothing when no process is running', () => {
      expect(() => Command.new([]).kill('SIGTERM')).not.toThrow();
    });
  });

  describe('throwIfException', () => {
    it('returns the command when no exception exists', () => {
      const command = Command.new([]);

      expect(command.throwIfException()).toBe(command);
    });

    it('throws the recorded exception', async () => {
      const command = await Command.new([unavailableCommand]).execAsync({}, {});

      expect(() => command.throwIfException()).toThrow(command.exception.error);
    });
  });

  describe('exit', () => {
    it('exits with the command exit code', async () => {
      const command = await Command.new([process.execPath, '-e', 'process.exit(3)']).execAsync(
        {},
        {}
      );
      const processExit = process.exit;
      const exitCodes = [];
      process.exit = (code) => exitCodes.push(code);

      try {
        command.exit();
      } finally {
        process.exit = processExit;
      }

      expect(exitCodes).toEqual([3]);
    });

    it('logs an exception before exiting', async () => {
      const command = await Command.new([unavailableCommand]).execAsync({}, {});
      const processExit = process.exit;
      const loggerWrite = Logger.write;
      const exitCodes = [];
      const messages = [];
      process.exit = (code) => exitCodes.push(code);
      Logger.write = (_, message) => messages.push(message);

      try {
        command.exit();
      } finally {
        process.exit = processExit;
        Logger.write = loggerWrite;
      }

      expect(exitCodes).toEqual([command.exitCode]);
      expect(messages[0]).toContain(command.exception.toString());
    });

    it('exits only on failure & otherwise returns the command', async () => {
      const success = await Command.new([process.execPath, '-e', '']).execAsync({}, {});
      const processExit = process.exit;
      const exitCodes = [];
      process.exit = (code) => exitCodes.push(code);

      try {
        expect(success.exitIfFailure()).toBe(success);
      } finally {
        process.exit = processExit;
      }

      expect(exitCodes).toEqual([]);
    });

    it('exits when the command has a nonzero exit code', async () => {
      const command = await Command.new([process.execPath, '-e', 'process.exit(3)']).execAsync(
        {},
        {}
      );
      const processExit = process.exit;
      const exitCodes = [];
      process.exit = (code) => exitCodes.push(code);

      try {
        expect(command.exitIfFailure()).toBe(command);
      } finally {
        process.exit = processExit;
      }

      expect(exitCodes).toEqual([3]);
    });
  });

  describe('loggingActionAsync', () => {
    it('logs start & end for a successful action', async () => {
      const loggerWrite = Logger.write;
      const messages = [];
      Logger.write = (name) => messages.push(name);

      try {
        await Command.loggingActionAsync(['task'], () => {});
      } finally {
        Logger.write = loggerWrite;
      }

      expect(messages).toEqual(['command-start', 'command-end']);
    });

    it('records action errors & restores process exit code', async () => {
      const loggerWrite = Logger.write;
      const processExitCode = process.exitCode;
      const messages = [];
      Logger.write = (name, message) => messages.push([name, message]);

      try {
        await Command.loggingActionAsync(['task'], () => {
          throw new Error('action failed');
        });
      } finally {
        Logger.write = loggerWrite;
        process.exitCode = processExitCode;
      }

      expect(process.exitCode).toBe(processExitCode);
      expect(messages[0][0]).toBe('command-start');
      expect(messages[1]).toEqual(['error', expect.stringContaining('action failed')]);
      expect(messages[2][0]).toBe('command-end');
    });
  });

  describe('logging handlers', () => {
    it('formats command start & end records', async () => {
      const success = await Command.new([process.execPath, '-e', '']).execAsync({}, {});
      const failure = await Command.new([process.execPath, '-e', 'process.exit(3)']).execAsync(
        {},
        {}
      );
      const startHandler = Logger.getHandlers('command-start')[0];
      const endHandler = Logger.getHandlers('command-end')[0];

      expect(startHandler.format(undefined, success)).toContain(success.toString());
      expect(endHandler.format(undefined, success)).toContain('(0)');
      expect(endHandler.format(undefined, failure)).toContain('(3)');
    });
  });
});
