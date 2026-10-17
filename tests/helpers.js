import { Logger } from '../dist/logger.js';

export function mockProcessExit(onExit = () => {}) {
  const exitCodes = [];
  vi.spyOn(process, 'exit').mockImplementation((code) => {
    exitCodes.push(code);
    onExit(code);
  });
  return exitCodes;
}

export function mockLoggerWrite(messages, format = (name, message) => [name, message]) {
  vi.spyOn(Logger, 'write').mockImplementation((name, message) => {
    messages.push(format(name, message));
  });
  return messages;
}
