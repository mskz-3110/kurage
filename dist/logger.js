import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
import { Timestamp } from './timestamp.js';

var Logger = class Logger {
  static $ = new Logger();
  static format(timestamp, arg) {
    return `[${timestamp}] ${String(arg)}`;
  }
  static {
    Color.$.set('debug', Color.$.get('cyan'));
    Color.$.set('info', Color.$.get('reset'));
    Color.$.set('warn', Color.$.get('yellow'));
    Color.$.set('error', Color.$.get('red'));
    Logger.$.addHandler('debug', {
      write: console.log,
      format: (timestamp, arg) => {
        return Color.$.paint('debug', Logger.format(timestamp, arg));
      },
    });
    Logger.$.addHandler('info', {
      write: console.log,
      format: (timestamp, arg) => {
        return Color.$.paint('info', Logger.format(timestamp, arg));
      },
    });
    Logger.$.addHandler('warn', {
      write: console.error,
      format: (timestamp, arg) => {
        return Color.$.paint('warn', Logger.format(timestamp, arg));
      },
    });
    Logger.$.addHandler('error', {
      write: console.error,
      format: (timestamp, arg) => {
        return Color.$.paint('error', Logger.format(timestamp, arg));
      },
    });
  }
  static new(...args) {
    return new Logger(...args);
  }
  #invalidNames = [
    ...Object.getOwnPropertyNames(Logger),
    ...Object.getOwnPropertyNames(Logger.prototype),
  ];
  #handlers = {};
  get names() {
    return Object.keys(this.#handlers);
  }
  getHandlers(name) {
    return Object.hasOwn(this.#handlers, name) ? this.#handlers[name] : [];
  }
  setHandlers(name, handlers) {
    this.#handlers[name] = handlers;
  }
  addHandler(name, handler) {
    if (this.#invalidNames.includes(name) || name === '') return;
    if (Object.hasOwn(this.#handlers, name)) this.#handlers[name].push(handler);
    else this.#handlers[name] = [handler];
  }
  write(name, arg, timestamp = Timestamp.new()) {
    if (!Object.hasOwn(this.#handlers, name)) {
      console.error(
        `Undefined logger name: ${name} # ${String(arg)}\n${Backtrace.new()}`
      );
      return;
    }
    for (const handler of this.#handlers[name])
      handler.write(handler.format(timestamp, arg));
  }
};

export { Logger };
