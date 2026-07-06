import { Exception } from './exception.js';
import { Logger } from './logger.js';

type Listeners = {
  uncaughtException: (e: unknown) => void;
  unhandledRejection: (reason: unknown) => void;
};

export class Process {
  static #uncaughtException = (e: unknown) => {
    Logger.$.write('error', [`UncaughtException: ${Exception.new(e)}`]);
  };

  static #unhandledRejection = (reason: unknown) => {
    Logger.$.write('error', [`UnhandledRejection: ${Exception.new(reason)}`]);
  };

  static #listeners: Listeners = {
    uncaughtException: Process.#uncaughtException,
    unhandledRejection: Process.#unhandledRejection,
  };

  static get args(): string[] {
    return process.argv.slice(2);
  }

  static setup() {
    for (const [name, handler] of Object.entries(Process.#listeners)) {
      try {
        if (!process.listeners(name).includes(handler)) {
          process.on(name, handler);
        }
      } catch (e: unknown) {
        if (e instanceof Error && 'code' in e) {
          if (e.code !== 'ERR_INVALID_REPL_INPUT') {
            throw e;
          }
        }
      }
    }
  }

  static cleanup() {
    for (const [name, handler] of Object.entries(Process.#listeners)) {
      if (process.listeners(name).includes(handler)) {
        process.off(name, handler);
      }
    }
  }

  static {
    Process.setup();
    process.on('exit', () => Process.cleanup());
  }
}
