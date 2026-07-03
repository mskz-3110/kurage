import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
import { Timestamp } from './timestamp.js';

var Logger = class Logger {
  static logger = new Logger();
  static format(payload) {
    return `[${payload.timestamp}] ${String(payload.args)}`;
  }
  static {
    Logger.logger.addHandler('debug', {
      write: console.log,
      format: (payload) => {
        return Color.color.paint('cyan', Logger.format(payload));
      },
    });
    Logger.logger.addHandler('info', {
      write: console.log,
      format: (payload) => {
        return Color.color.paint('reset', Logger.format(payload));
      },
    });
    Logger.logger.addHandler('warn', {
      write: console.error,
      format: (payload) => {
        return Color.color.paint('yellow', Logger.format(payload));
      },
    });
    Logger.logger.addHandler('error', {
      write: console.error,
      format: (payload) => {
        return Color.color.paint('red', Logger.format(payload));
      },
    });
  }
  static new(...args) {
    return new Logger(...args);
  }
  #invalidNames = [...Object.getOwnPropertyNames(Logger), ...Object.getOwnPropertyNames(Logger.prototype)];
  #handlers = {};
  get names() {
    return Object.keys(this.#handlers);
  }
  addHandler(name, handler) {
    if (this.#invalidNames.includes(name) || name === '') return;
    if (Object.hasOwn(this.#handlers, name)) this.#handlers[name].push(handler);
    else this.#handlers[name] = [handler];
  }
  write(name, args, timestamp) {
    if (!Object.hasOwn(this.#handlers, name)) {
      console.error(`${String(args)}\n${Backtrace.new()}`);
      return;
    }
    const payload = {
      timestamp: timestamp ?? Timestamp.new(),
      args,
    };
    for (const handler of this.#handlers[name]) handler.write(handler.format(payload));
  }
};

export { Logger };
