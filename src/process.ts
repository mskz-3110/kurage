import { Exception } from './exception.js';
import { Logger } from './logger.js';

type Listeners = {
  uncaughtException: (e: unknown) => void;
  unhandledRejection: (reason: unknown) => void;
};

export class Process {
  static #uncaughtException = (e: unknown) => {
    Logger.write('error', `UncaughtException: ${Exception.new(e).toString()}`);
    process.exit(1);
  };

  static #unhandledRejection = (reason: unknown) => {
    Logger.write('error', `UnhandledRejection: ${Exception.new(reason).toString()}`);
    process.exit(1);
  };

  static #listeners: Listeners = {
    uncaughtException: Process.#uncaughtException,
    unhandledRejection: Process.#unhandledRejection,
  };

  static get args(): readonly string[] {
    return process.argv.slice(2);
  }

  static abort(message: string = '', exitCode: number = 1): never {
    if (message !== '') {
      Logger.write('error', message);
    }
    process.exit(exitCode);
  }

  static setup() {
    for (const [name, handler] of Object.entries(Process.#listeners)) {
      if (!process.listeners(name).includes(handler)) {
        process.on(name, handler);
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
