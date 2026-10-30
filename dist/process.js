import { Exception } from './exception.js';
import { Logger } from './logger.js';

var Process = class Process {
  static #uncaughtException = (e) => {
    Logger.write('error', `UncaughtException: ${Exception.new(e).toString()}`);
    process.exit(1);
  };
  static #unhandledRejection = (reason) => {
    Logger.write('error', `UnhandledRejection: ${Exception.new(reason).toString()}`);
    process.exit(1);
  };
  static #listeners = {
    uncaughtException: Process.#uncaughtException,
    unhandledRejection: Process.#unhandledRejection,
  };
  static get args() {
    return process.argv.slice(2);
  }
  static abort(message = '', exitCode = 1) {
    if (message !== '') Logger.write('error', message);
    process.exit(exitCode);
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
