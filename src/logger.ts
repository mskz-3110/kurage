import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
import { Line } from './line.js';
import { Time } from './time.js';

export type Write = (message: string) => void;

export type Format = (time: Time, arg: any) => string;

export type Handler = {
  write: Write;
  format: Format;
};

export class Logger {
  static #handlers: Record<string, Handler[]> = Object.create(null);

  static #outStreams: NodeJS.WritableStream[] = [process.stdout];

  static #errStreams: NodeJS.WritableStream[] = [process.stderr];

  static #invalidNames: string[] = [
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
      format: (time: Time, arg: any) => {
        return Color.paint('debug', Logger.format(time, arg));
      },
    });

    Logger.addHandler('info', {
      write: Logger.out,
      format: (time: Time, arg: any) => {
        return Color.paint('info', Logger.format(time, arg));
      },
    });

    Logger.addHandler('warn', {
      write: Logger.err,
      format: (time: Time, arg: any) => {
        return Color.paint('warn', Logger.format(time, arg));
      },
    });

    Logger.addHandler('error', {
      write: Logger.err,
      format: (time: Time, arg: any) => {
        return Color.paint('error', Logger.format(time, arg));
      },
    });
  }

  static out(message: string) {
    for (const stream of Logger.#outStreams) {
      stream.write(`${message}${Line.eol}`);
    }
  }

  static err(message: string) {
    for (const stream of Logger.#errStreams) {
      stream.write(`${message}${Line.eol}`);
    }
  }

  static addOutStream(stream: NodeJS.WritableStream) {
    if (!Logger.#outStreams.includes(stream)) {
      Logger.#outStreams.push(stream);
    }
  }

  static removeOutStream(stream: NodeJS.WritableStream) {
    const index = Logger.#outStreams.indexOf(stream);
    if (index !== -1) {
      Logger.#outStreams.splice(index, 1);
    }
  }

  static addErrStream(stream: NodeJS.WritableStream) {
    if (!Logger.#errStreams.includes(stream)) {
      Logger.#errStreams.push(stream);
    }
  }

  static removeErrStream(stream: NodeJS.WritableStream) {
    const index = Logger.#errStreams.indexOf(stream);
    if (index !== -1) {
      Logger.#errStreams.splice(index, 1);
    }
  }

  static format(time: Time, arg: any): string {
    return `[${time}] ${String(arg)}`;
  }

  static get names(): readonly string[] {
    return Object.keys(Logger.#handlers);
  }

  static getHandlers(name: string): Handler[] {
    return Object.hasOwn(Logger.#handlers, name) ? Logger.#handlers[name]! : [];
  }

  static setHandlers(name: string, handlers: Handler[]) {
    Logger.#handlers[name] = handlers;
  }

  static unsetHandlers(name: string) {
    delete Logger.#handlers[name];
  }

  static addHandler(name: string, handler: Handler) {
    if (Logger.#invalidNames.includes(name) || name === '') {
      return;
    }

    if (Object.hasOwn(Logger.#handlers, name)) {
      Logger.#handlers[name]!.push(handler);
    } else {
      Logger.#handlers[name] = [handler];
    }
  }

  static write(name: string, arg: any, time: Time = Time.new()) {
    if (!Object.hasOwn(Logger.#handlers, name)) {
      Logger.err(
        `Undefined logger name: ${name} # ${String(arg)}${Line.eol}${Backtrace.new()}`
      );
      return;
    }

    for (const handler of Logger.#handlers[name]!) {
      handler.write(handler.format(time, arg));
    }
  }
}
