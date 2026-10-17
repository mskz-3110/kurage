import { Logger } from '../dist/logger.js';
import { Time } from '../dist/time.js';

afterEach(() => {
  vi.restoreAllMocks();
  Logger.unsetHandlers('test');
  Logger.unsetHandlers('replace');
  Logger.unsetHandlers('write');
});

describe('Logger', () => {
  it('exposes the built-in logger names', () => {
    expect(Logger.names).toContain('debug');
    expect(Logger.names).toContain('info');
    expect(Logger.names).toContain('warn');
    expect(Logger.names).toContain('error');
  });

  it('returns handlers for a name & an empty list when missing', () => {
    expect(Logger.getHandlers('missing')).toEqual([]);
    expect(Logger.getHandlers('info').length).toBeGreaterThan(0);
  });

  it('adds handlers & writes formatted messages', () => {
    const messages = [];
    const handler = {
      write: (message) => messages.push(message),
      format: (time, arg) => `${time}:${arg}`,
    };
    const name = 'test';
    const time = Time.new();

    Logger.addHandler(name, handler);
    Logger.addHandler(name, handler);
    Logger.write(name, 'message', time);

    expect(Logger.getHandlers(name)).toEqual([handler, handler]);
    expect(messages).toEqual([`${time}:message`, `${time}:message`]);
  });

  it('ignores empty names & built-in names when adding handlers', () => {
    const handler = {
      write: () => {},
      format: () => '',
    };

    Logger.addHandler('', handler);
    Logger.addHandler('write', handler);

    expect(Logger.names).not.toContain('');
    expect(Logger.names).not.toContain('write');
  });

  it('replaces handlers for a logger name', () => {
    const name = 'replace';
    const handlers = [];

    Logger.setHandlers(name, handlers);

    expect(Logger.getHandlers(name)).toBe(handlers);
    expect(Logger.names).toContain(name);
  });

  it('removes handlers for a logger name', () => {
    Logger.setHandlers('test', []);

    Logger.unsetHandlers('test');

    expect(Logger.getHandlers('test')).toEqual([]);
    expect(Logger.names).not.toContain('test');
  });

  it('removes handlers registered under a method name', () => {
    Logger.setHandlers('write', []);

    Logger.unsetHandlers('write');

    expect(Logger.names).not.toContain('write');
  });

  it('formats arguments for the built-in loggers', () => {
    const time = Time.new();
    expect(Logger.format(time, 'message')).toBe(`[${time}] message`);

    ['debug', 'info', 'warn', 'error'].forEach((name) => {
      const handler = Logger.getHandlers(name)[0];
      expect(typeof handler.format(time, 'message')).toBe('string');
    });
  });

  it('writes to registered output streams & removes them', () => {
    const outMessages = [];
    const errMessages = [];
    const outStream = { write: (message) => outMessages.push(message) };
    const errStream = { write: (message) => errMessages.push(message) };
    vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    vi.spyOn(process.stderr, 'write').mockReturnValue(true);

    try {
      Logger.addOutStream(outStream);
      Logger.addOutStream(outStream);
      Logger.addErrStream(errStream);
      Logger.addErrStream(errStream);
      Logger.out('out message');
      Logger.err('err message');
      Logger.removeOutStream(outStream);
      Logger.removeErrStream(errStream);
      Logger.out('ignored out message');
      Logger.err('ignored err message');
    } finally {
      Logger.removeOutStream(outStream);
      Logger.removeErrStream(errStream);
    }

    expect(outMessages).toEqual(['out message\n']);
    expect(errMessages).toEqual(['err message\n']);
  });

  it('reports writes to an undefined logger name', () => {
    const messages = [];
    vi.spyOn(Logger, 'err').mockImplementation((message) => messages.push(message));

    Logger.write('missing', 'message', Time.new());

    expect(messages[0]).toContain('Undefined logger name: missing # message');
  });
});
