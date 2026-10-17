import { Logger } from '../dist/logger.js';
import { Process } from '../dist/process.js';

describe('Process', () => {
  it('args', () => {
    const argv = process.argv;
    const args = ['test'];
    process.argv = [...argv.slice(0, 2), ...args];

    try {
      expect(Process.args).toEqual(args);
    } finally {
      process.argv = argv;
    }
  });

  it('abort', () => {
    const processExit = process.exit;
    const loggerWrite = Logger.write;
    const exitCodes = [];
    const messages = [];
    process.exit = (code) => exitCodes.push(code);
    Logger.write = (name, message) => messages.push([name, message]);

    try {
      Process.abort('stopped', 2);
      Process.abort();
    } finally {
      process.exit = processExit;
      Logger.write = loggerWrite;
    }

    expect(messages).toEqual([['error', 'stopped']]);
    expect(exitCodes).toEqual([2, 1]);
  });

  it('exception', () => {
    const processExit = process.exit;
    const loggerWrite = Logger.write;
    const exitCodes = [];
    const messages = [];
    process.exit = (code) => exitCodes.push(code);
    Logger.write = (name, message) => messages.push([name, message]);

    try {
      process.emit('uncaughtException', new Error('uncaught'));
      process.emit('unhandledRejection', 'rejected');
    } finally {
      process.exit = processExit;
      Logger.write = loggerWrite;
    }

    expect(messages[0][0]).toBe('error');
    expect(messages[0][1]).toContain('UncaughtException:');
    expect(messages[0][1]).toContain('uncaught');
    expect(messages[1][0]).toBe('error');
    expect(messages[1][1]).toContain('UnhandledRejection:');
    expect(messages[1][1]).toContain('rejected');
    expect(exitCodes).toEqual([1, 1]);
  });

  it('setup & cleanup', () => {
    const listenerCount = process.listeners('uncaughtException').length;

    try {
      Process.setup();
      Process.setup();
      expect(process.listeners('uncaughtException')).toHaveLength(listenerCount);

      Process.cleanup();
      expect(process.listeners('uncaughtException')).toHaveLength(listenerCount - 1);
      Process.cleanup();

      Process.setup();
      expect(process.listeners('uncaughtException')).toHaveLength(listenerCount);
    } finally {
      Process.setup();
    }
  });

  it('exit', () => {
    const exitListener = process
      .listeners('exit')
      .find((listener) => listener.toString().includes('Process.cleanup'));
    const cleanup = Process.cleanup;
    let called = false;
    Process.cleanup = () => {
      called = true;
    };

    try {
      exitListener();
    } finally {
      Process.cleanup = cleanup;
    }

    expect(called).toBe(true);
  });
});
