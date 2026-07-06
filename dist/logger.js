import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
import { Timestamp } from './timestamp.js';

var Logger = class Logger {
  static $ = new Logger();
  static format(timestamp, arg) {
    return `[${timestamp}] ${String(arg)}`;
  }
  static {
    Logger.$.addHandler('debug', {
      write: console.log,
      format: (timestamp, arg) => {
        return Color.$.paint('cyan', Logger.format(timestamp, arg));
      },
    });
    Logger.$.addHandler('info', {
      write: console.log,
      format: (timestamp, arg) => {
        return Color.$.paint('reset', Logger.format(timestamp, arg));
      },
    });
    Logger.$.addHandler('warn', {
      write: console.error,
      format: (timestamp, arg) => {
        return Color.$.paint('yellow', Logger.format(timestamp, arg));
      },
    });
    Logger.$.addHandler('error', {
      write: console.error,
      format: (timestamp, arg) => {
        return Color.$.paint('red', Logger.format(timestamp, arg));
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
  write(name, arg, timestamp = Timestamp.new()) {
    if (!Object.hasOwn(this.#handlers, name)) {
      console.error(`${String(arg)}\n${Backtrace.new()}`);
      return;
    }
    for (const handler of this.#handlers[name]) handler.write(handler.format(timestamp, arg));
  }
};

export { Logger };
