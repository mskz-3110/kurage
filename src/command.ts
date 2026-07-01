import type { ChildProcess, SpawnOptions } from 'node:child_process';
import childProcessModule from 'node:child_process';
import { Exception } from './exception.js';
import { Stopwatch } from './stopwatch.js';
import { Timestamp } from './timestamp.js';

export interface ExecHooks<T> {
  onStart?: (command: Command) => T;
  onEnd?: (command: Command, context: T) => void;
}

export const defaultExecHooks: ExecHooks<void> = {
  onStart: (command) => {
    console.error(`[${Timestamp.new()}] ${process.cwd()} @ ${command}`);
  },
  onEnd: (command) => {
    console.error(`[${Timestamp.new()}] ${command.elapsedTime.toFixed(3)}ms (${command.exitCode}) @ ${command}`);
  },
};

export class Command {
  static #commandLineSafeStringRegex = /^[a-zA-Z0-9/._-]+$/;

  static new(...args: ConstructorParameters<typeof Command>): Command {
    return new Command(...args);
  }

  #command: string = '';

  get command(): string {
    return this.#command;
  }

  #args: string[] = [];

  get args(): string[] {
    return this.#args;
  }

  #stopwatch: Stopwatch = Stopwatch.new();

  get elapsedTime(): number {
    return this.#stopwatch.elapsedTime;
  }

  #process: ChildProcess | undefined;

  get process(): ChildProcess | undefined {
    return this.#process;
  }

  get exitCode(): number {
    if (this.#process != null && this.#process.exitCode != null) {
      return this.#process!.exitCode!;
    }

    return this.#exception != null ? 1 : 0;
  }

  #exception: Exception | undefined;

  get exception(): Exception | undefined {
    return this.#exception;
  }

  constructor(...args: string[]) {
    this.#command = args[0] ?? '';
    this.#args = args.slice(1);
  }

  #appendExceptionMessage(): Command {
    if (this.#exception != null) {
      this.#exception.error.message =
        this.#exception.error.message === '' ? this.toString() : `${this.#exception.error.message} @ ${this}`;
    }
    return this;
  }

  async execAsync<T = void>(options: SpawnOptions = {}, hooks: ExecHooks<T> = {}): Promise<Command> {
    this.#stopwatch.start();
    const context = hooks.onStart?.(this);
    return new Promise((resolve) => {
      try {
        this.#process = undefined;
        this.#exception = undefined;

        if (this.#command === '') {
          this.#stopwatch.stop();
          hooks.onEnd?.(this, context as T);
          return resolve(this);
        }

        this.#process = childProcessModule.spawn(this.command, this.args, { stdio: 'inherit', ...options });

        this.#process.on('close', (exitCode, signalName) => {
          if (signalName != null) {
            this.#exception = Exception.new(`SignalException: ${signalName} @ ${this}`);
          } else if (exitCode !== 0) {
            this.#exception = Exception.new(`ExitCodeException: ${exitCode} @ ${this}`);
          }

          this.#stopwatch.stop();
          hooks.onEnd?.(this, context as T);
          return resolve(this);
        });

        this.#process.on('error', (e) => {
          this.#exception = Exception.new(e);
          this.#appendExceptionMessage();
          this.#stopwatch.stop();
          hooks.onEnd?.(this, context as T);
          return resolve(this);
        });
      } catch (e: unknown) {
        this.#exception = Exception.new(e);
        this.#appendExceptionMessage();
        this.#stopwatch.stop();
        hooks.onEnd?.(this, context as T);
        return resolve(this);
      }
    });
  }

  throwIfException() {
    if (this.#exception != null) {
      throw this.#exception;
    }
  }

  exit() {
    process.exit(this.exitCode);
  }

  toString(): string {
    return [
      this.#command,
      ...this.#args.map((arg) => (Command.#commandLineSafeStringRegex.test(arg) ? arg : JSON.stringify(arg))),
    ].join(' ');
  }
}
