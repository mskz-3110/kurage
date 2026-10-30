import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
import { Line } from './line.js';
import { Time } from './time.js';

var Logger = class Logger {
  static #handlers = Object.create(null);
  static #outStreams = [process.stdout];
  static #errStreams = [process.stderr];
  static #invalidNames = [
    ...Object.getOwnPropertyNames(Logger),
    ...Object.getOwnPropertyNames(Logger.prototype),
  ];
  static {
    Color.set('debug', Color.get('cyan'));
    Color.set('info', Color.get('reset'));
    Color.set('warn', Color.get('yellow'));
    Color.set('error', Color.get('red'));
    Logger.addHandler('debug', {
      write: Logger.out,
      format: (time, arg) => {
        return Color.paint('debug', Logger.format(time, arg));
      },
    });
    Logger.addHandler('info', {
      write: Logger.out,
      format: (time, arg) => {
        return Color.paint('info', Logger.format(time, arg));
      },
    });
    Logger.addHandler('warn', {
      write: Logger.err,
      format: (time, arg) => {
        return Color.paint('warn', Logger.format(time, arg));
      },
    });
    Logger.addHandler('error', {
      write: Logger.err,
      format: (time, arg) => {
        return Color.paint('error', Logger.format(time, arg));
      },
    });
  }
  static out(message) {
    for (const stream of Logger.#outStreams) stream.write(`${message}${Line.eol}`);
  }
  static err(message) {
    for (const stream of Logger.#errStreams) stream.write(`${message}${Line.eol}`);
  }
  static addOutStream(stream) {
    if (!Logger.#outStreams.includes(stream)) Logger.#outStreams.push(stream);
  }
  static removeOutStream(stream) {
    const index = Logger.#outStreams.indexOf(stream);
    if (index !== -1) Logger.#outStreams.splice(index, 1);
  }
  static addErrStream(stream) {
    if (!Logger.#errStreams.includes(stream)) Logger.#errStreams.push(stream);
  }
  static removeErrStream(stream) {
    const index = Logger.#errStreams.indexOf(stream);
    if (index !== -1) Logger.#errStreams.splice(index, 1);
  }
  static format(time, arg) {
    return `[${time}] ${String(arg)}`;
  }
  static get names() {
    return Object.keys(Logger.#handlers);
  }
  static getHandlers(name) {
    return Object.hasOwn(Logger.#handlers, name) ? Logger.#handlers[name] : [];
  }
  static setHandlers(name, handlers) {
    Logger.#handlers[name] = handlers;
  }
  static unsetHandlers(name) {
    delete Logger.#handlers[name];
  }
  static addHandler(name, handler) {
    if (Logger.#invalidNames.includes(name) || name === '') return;
    if (Object.hasOwn(Logger.#handlers, name)) Logger.#handlers[name].push(handler);
    else Logger.#handlers[name] = [handler];
  }
  static write(name, arg, time = Time.new()) {
    if (!Object.hasOwn(Logger.#handlers, name)) {
      Logger.err(
        `Undefined logger name: ${name} # ${String(arg)}${Line.eol}${Backtrace.new()}`
      );
      return;
    }
    for (const handler of Logger.#handlers[name])
      handler.write(handler.format(time, arg));
  }
};

export { Logger };
