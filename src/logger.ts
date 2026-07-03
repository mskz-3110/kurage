import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
import { Timestamp } from './timestamp.js';

export interface Payload {
  timestamp: Timestamp;
  args: unknown[];
}

export type Write = (message: string) => void;

export type Format = (payload: Payload) => string;

interface Handler {
  write: Write;
  format: Format;
}

export class Logger {
  static logger: Logger = new Logger();

  static format(payload: Payload): string {
    return `[${payload.timestamp}] ${String(payload.args)}`;
  }

  static {
    Logger.logger.addHandler('debug', {
      write: console.log,
      format: (payload: Payload) => {
        return Color.color.paint('cyan', Logger.format(payload));
      },
    });

    Logger.logger.addHandler('info', {
      write: console.log,
      format: (payload: Payload) => {
        return Color.color.paint('reset', Logger.format(payload));
      },
    });

    Logger.logger.addHandler('warn', {
      write: console.error,
      format: (payload: Payload) => {
        return Color.color.paint('yellow', Logger.format(payload));
      },
    });

    Logger.logger.addHandler('error', {
      write: console.error,
      format: (payload: Payload) => {
        return Color.color.paint('red', Logger.format(payload));
      },
    });
  }

  static new(...args: ConstructorParameters<typeof Logger>): Logger {
    return new Logger(...args);
  }

  #invalidNames: string[] = [...Object.getOwnPropertyNames(Logger), ...Object.getOwnPropertyNames(Logger.prototype)];

  #handlers: Record<string, Handler[]> = {};

  get names(): string[] {
    return Object.keys(this.#handlers);
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

  write(name: string, args: unknown[], timestamp?: Timestamp) {
    if (!Object.hasOwn(this.#handlers, name)) {
      console.error(`${String(args)}\n${Backtrace.new()}`);
      return;
    }

    const payload = { timestamp: timestamp ?? Timestamp.new(), args };
    for (const handler of this.#handlers[name]!) {
      handler.write(handler.format(payload));
    }
  }
}
