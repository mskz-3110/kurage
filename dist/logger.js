import utilModule from 'node:util';
import { Color } from './color.js';
import { Timestamp } from './timestamp.js';

var Logger = class Logger {
  static #invalidNames = Object.getOwnPropertyNames(Logger);
  static logger = new Logger();
  static new(...args) {
    return new Logger(...args);
  }
  #handlers = {};
  get names() {
    return Object.keys(this.#handlers);
  }
  constructor() {
    this.addHandler('debug', {
      write: console.log,
      format: (payload) => {
        return Color.paint('cyan', this.format(payload));
      },
    });
    this.addHandler('info', {
      write: console.log,
      format: (payload) => {
        return Color.paint('reset', this.format(payload));
      },
    });
    this.addHandler('warn', {
      write: console.error,
      format: (payload) => {
        return Color.paint('yellow', this.format(payload));
      },
    });
    this.addHandler('error', {
      write: console.error,
      format: (payload) => {
        return Color.paint('red', this.format(payload));
      },
    });
  }
  write(name, args, timestamp) {
    if (!Object.hasOwn(this.#handlers, name)) {
      console.error(utilModule.inspect(args, false, null, true));
      return;
    }
    const payload = {
      timestamp: timestamp ?? Timestamp.new(),
      args,
    };
    for (const handler of this.#handlers[name]) handler.write(handler.format(payload));
  }
  format = (payload) => {
    return `[${payload.timestamp}] ${String(payload.args)}`;
  };
  addHandler(name, handler) {
    if (Logger.#invalidNames.includes(name) || name === '') return;
    if (Object.hasOwn(this.#handlers, name)) this.#handlers[name].push(handler);
    else this.#handlers[name] = [handler];
  }
};

export { Logger };
