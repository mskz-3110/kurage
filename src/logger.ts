import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
import { Timestamp } from './timestamp.js';

export type Write = (message: string) => void;

export type Format<T = any> = (timestamp: Timestamp, arg: T) => string;

interface Handler<T = any> {
  write: Write;
  format: Format<T>;
}

export class Logger {
  static $: Logger = new Logger();

  static format(timestamp: Timestamp, arg: any): string {
    return `[${timestamp}] ${String(arg)}`;
  }

  static {
    Logger.$.addHandler('debug', {
      write: console.log,
      format: (timestamp: Timestamp, arg: any) => {
        return Color.$.paint('cyan', Logger.format(timestamp, arg));
      },
    });

    Logger.$.addHandler('info', {
      write: console.log,
      format: (timestamp: Timestamp, arg: any) => {
        return Color.$.paint('reset', Logger.format(timestamp, arg));
      },
    });

    Logger.$.addHandler('warn', {
      write: console.error,
      format: (timestamp: Timestamp, arg: any) => {
        return Color.$.paint('yellow', Logger.format(timestamp, arg));
      },
    });

    Logger.$.addHandler('error', {
      write: console.error,
      format: (timestamp: Timestamp, arg: any) => {
        return Color.$.paint('red', Logger.format(timestamp, arg));
      },
    });
  }

  static new(...args: ConstructorParameters<typeof Logger>): Logger {
    return new Logger(...args);
  }

  #invalidNames: string[] = [
    ...Object.getOwnPropertyNames(Logger),
    ...Object.getOwnPropertyNames(Logger.prototype),
  ];

  #handlers: Record<string, Handler[]> = {};

  get names(): readonly string[] {
    return Object.keys(this.#handlers);
  }

  addHandler<T>(name: string, handler: Handler<T>) {
    if (this.#invalidNames.includes(name) || name === '') {
      return;
    }

    if (Object.hasOwn(this.#handlers, name)) {
      this.#handlers[name]!.push(handler);
    } else {
      this.#handlers[name] = [handler];
    }
  }

  write<T>(name: string, arg: T, timestamp: Timestamp = Timestamp.new()) {
    if (!Object.hasOwn(this.#handlers, name)) {
      console.error(`${String(arg)}\n${Backtrace.new()}`);
      return;
    }

    for (const handler of this.#handlers[name]!) {
      handler.write(handler.format(timestamp, arg));
    }
  }
}
