import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
import { Timestamp } from './timestamp.js';

export type Write = (message: string) => void;

export type Format = (timestamp: Timestamp, arg: any) => string;

export type Handler = {
  write: Write;
  format: Format;
};

export class Logger {
  static $: Logger = new Logger();

  static format(timestamp: Timestamp, arg: any): string {
    return `[${timestamp}] ${String(arg)}`;
  }

  static {
    Color.$.set('debug', Color.$.get('cyan'));
    Color.$.set('info', Color.$.get('reset'));
    Color.$.set('warn', Color.$.get('yellow'));
    Color.$.set('error', Color.$.get('red'));

    Logger.$.addHandler('debug', {
      write: console.log,
      format: (timestamp: Timestamp, arg: any) => {
        return Color.$.paint('debug', Logger.format(timestamp, arg));
      },
    });

    Logger.$.addHandler('info', {
      write: console.log,
      format: (timestamp: Timestamp, arg: any) => {
        return Color.$.paint('info', Logger.format(timestamp, arg));
      },
    });

    Logger.$.addHandler('warn', {
      write: console.error,
      format: (timestamp: Timestamp, arg: any) => {
        return Color.$.paint('warn', Logger.format(timestamp, arg));
      },
    });

    Logger.$.addHandler('error', {
      write: console.error,
      format: (timestamp: Timestamp, arg: any) => {
        return Color.$.paint('error', Logger.format(timestamp, arg));
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

  getHandlers(name: string): Handler[] {
    return Object.hasOwn(this.#handlers, name) ? this.#handlers[name]! : [];
  }

  setHandlers(name: string, handlers: Handler[]) {
    this.#handlers[name] = handlers;
  }

  addHandler(name: string, handler: Handler) {
    if (this.#invalidNames.includes(name) || name === '') {
      return;
    }

    if (Object.hasOwn(this.#handlers, name)) {
      this.#handlers[name]!.push(handler);
    } else {
      this.#handlers[name] = [handler];
    }
  }

  write(name: string, arg: any, timestamp: Timestamp = Timestamp.new()) {
    if (!Object.hasOwn(this.#handlers, name)) {
      console.error(
        `Undefined logger name: ${name} # ${String(arg)}\n${Backtrace.new()}`
      );
      return;
    }

    for (const handler of this.#handlers[name]!) {
      handler.write(handler.format(timestamp, arg));
    }
  }
}
