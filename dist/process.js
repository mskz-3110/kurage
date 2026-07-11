import { Exception } from './exception.js';
import { Logger } from './logger.js';

var Process = class Process {
  static #uncaughtException = (e) => {
    Logger.$.write('error', Exception.new(e).toString());
    process.exit(1);
  };
  static #unhandledRejection = (reason) => {
    Logger.$.write('error', Exception.new(reason).toString());
    process.exit(1);
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
      try {
        if (!process.listeners(name).includes(handler)) process.on(name, handler);
      } catch (e) {
        if (e instanceof Error && 'code' in e) {
          if (e.code !== 'ERR_INVALID_REPL_INPUT') throw e;
        }
      }
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
