import { Process } from '../dist/process.js';
import { mockLoggerWrite, mockProcessExit } from './helpers.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Process', () => {
  it('returns command-line arguments after the executable', () => {
    const argv = process.argv;
    const args = ['test'];
    process.argv = [...argv.slice(0, 2), ...args];

    try {
      expect(Process.args).toEqual(args);
    } finally {
      process.argv = argv;
    }
  });

  it('logs an optional message & exits with the requested code', () => {
    const exitCodes = mockProcessExit();
    const messages = [];
    mockLoggerWrite(messages);

    Process.abort('stopped', 2);
    Process.abort();

    expect(messages).toEqual([['error', 'stopped']]);
    expect(exitCodes).toEqual([2, 1]);
  });

  it('logs uncaught exceptions & unhandled rejections before exiting', () => {
    const exitCodes = mockProcessExit();
    const messages = [];
    mockLoggerWrite(messages);

    process.emit('uncaughtException', new Error('uncaught'));
    process.emit('unhandledRejection', 'rejected');

    expect(messages[0][0]).toBe('error');
    expect(messages[0][1]).toContain('UncaughtException:');
    expect(messages[0][1]).toContain('uncaught');
    expect(messages[1][0]).toBe('error');
    expect(messages[1][1]).toContain('UnhandledRejection:');
    expect(messages[1][1]).toContain('rejected');
    expect(exitCodes).toEqual([1, 1]);
  });

  it('registers process listeners once & removes them on cleanup', () => {
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

  it('cleans up listeners when the process exits', () => {
    const exitListener = process
      .listeners('exit')
      .find((listener) => listener.toString().includes('Process.cleanup'));
    let called = false;
    vi.spyOn(Process, 'cleanup').mockImplementation(() => {
      called = true;
    });

    exitListener();

    expect(called).toBe(true);
  });
});
