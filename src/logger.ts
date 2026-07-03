import utilModule from 'node:util';
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
  static #invalidNames: string[] = Object.getOwnPropertyNames(Logger);

  static logger: Logger = new Logger();

  static new(...args: ConstructorParameters<typeof Logger>): Logger {
    return new Logger(...args);
  }

  #handlers: Record<string, Handler[]> = {};

  get names(): string[] {
    return Object.keys(this.#handlers);
  }

  constructor() {
    this.addHandler('debug', {
      write: console.log,
      format: (payload: Payload) => {
        return Color.paint('cyan', this.format(payload));
      },
    });

    this.addHandler('info', {
      write: console.log,
      format: (payload: Payload) => {
        return Color.paint('reset', this.format(payload));
      },
    });

    this.addHandler('warn', {
      write: console.error,
      format: (payload: Payload) => {
        return Color.paint('yellow', this.format(payload));
      },
    });

    this.addHandler('error', {
      write: console.error,
      format: (payload: Payload) => {
        return Color.paint('red', this.format(payload));
      },
    });
  }

  write(name: string, args: unknown[], timestamp?: Timestamp) {
    if (!Object.hasOwn(this.#handlers, name)) {
      console.error(utilModule.inspect(args, false, null, true));
      return;
    }

    const payload = { timestamp: timestamp ?? Timestamp.new(), args };
    for (const handler of this.#handlers[name]!) {
      handler.write(handler.format(payload));
    }
  }

  format: Format = (payload: Payload): string => {
    return `[${payload.timestamp}] ${String(payload.args)}`;
  };

  addHandler(name: string, handler: Handler) {
    if (Logger.#invalidNames.includes(name) || name === '') {
      return;
    }

    if (Object.hasOwn(this.#handlers, name)) {
      this.#handlers[name]!.push(handler);
    } else {
      this.#handlers[name] = [handler];
    }
  }
}
