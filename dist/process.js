import { Exception } from './exception.js';
import { Logger } from './logger.js';

var Process = class Process {
  static #uncaughtException = (e) => {
    Logger.logger.write('error', [`UncaughtException: ${Exception.new(e)}`]);
  };
  static #unhandledRejection = (reason) => {
    Logger.logger.write('error', [`UnhandledRejection: ${Exception.new(reason)}`]);
  };
  static #listeners = {
    uncaughtException: Process.#uncaughtException,
    unhandledRejection: Process.#unhandledRejection,
  };
  static get args() {
    return process.argv.slice(2);
  }
  static setup() {
    for (const [name, handler] of Object.entries(Process.#listeners))
      if (!process.listeners(name).includes(handler)) process.on(name, handler);
  }
  static cleanup() {
    for (const [name, handler] of Object.entries(Process.#listeners))
      if (process.listeners(name).includes(handler)) process.off(name, handler);
  }
  static {
    Process.setup();
    process.on('exit', () => Process.cleanup());
  }
};

export { Process };
