import { Logger } from '../dist/logger.js';
import { Time } from '../dist/time.js';

describe('Logger', () => {
  it('names', () => {
    expect(Logger.names).toContain('debug');
    expect(Logger.names).toContain('info');
    expect(Logger.names).toContain('warn');
    expect(Logger.names).toContain('error');
  });

  it('getHandlers', () => {
    expect(Logger.getHandlers('missing')).toEqual([]);
    expect(Logger.getHandlers('info').length).toBeGreaterThan(0);
  });

  it('addHandler & write', () => {
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

  it('addHandler: ignores invalid names', () => {
    const handler = {
      write: () => {},
      format: () => '',
    };

    Logger.addHandler('', handler);
    Logger.addHandler('write', handler);

    expect(Logger.names).not.toContain('');
    expect(Logger.names).not.toContain('write');
  });

  it('setHandlers', () => {
    const name = 'replace';
    const handlers = [];

    Logger.setHandlers(name, handlers);

    expect(Logger.getHandlers(name)).toBe(handlers);
    expect(Logger.names).toContain(name);
  });

  it('format', () => {
    const time = Time.new();
    expect(Logger.format(time, 'message')).toBe(`[${time}] message`);

    ['debug', 'info', 'warn', 'error'].forEach((name) => {
      const handler = Logger.getHandlers(name)[0];
      expect(typeof handler.format(time, 'message')).toBe('string');
    });
  });

  it('out & err', () => {
    const outMessages = [];
    const errMessages = [];
    const outStream = { write: (message) => outMessages.push(message) };
    const errStream = { write: (message) => errMessages.push(message) };
    const stdoutWrite = process.stdout.write;
    const stderrWrite = process.stderr.write;
    process.stdout.write = () => true;
    process.stderr.write = () => true;

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
      process.stdout.write = stdoutWrite;
      process.stderr.write = stderrWrite;
    }

    expect(outMessages).toEqual(['out message\n']);
    expect(errMessages).toEqual(['err message\n']);
  });

  it('write: undefined logger name', () => {
    const loggerErr = Logger.err;
    const messages = [];
    Logger.err = (message) => messages.push(message);

    try {
      Logger.write('missing', 'message', Time.new());
    } finally {
      Logger.err = loggerErr;
    }

    expect(messages[0]).toContain('Undefined logger name: missing # message');
  });
});
