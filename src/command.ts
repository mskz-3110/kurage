import type { ChildProcess, SpawnOptions } from 'node:child_process';
import childProcessModule from 'node:child_process';
import { Color } from './color.js';
import { Duration } from './duration.js';
import { Exception } from './exception.js';
import { Logger } from './logger.js';
import { Stopwatch } from './stopwatch.js';
import type { Timestamp } from './timestamp.js';

export interface ExecHooks<T> {
  onStart?: (command: Command) => T;
  onEnd?: (command: Command, context: T) => void;
}

export const defaultExecHooks: ExecHooks<void> = {
  onStart: (command) => Logger.$.write('command-start', command),
  onEnd: (command) => Logger.$.write('command-end', command),
};

export class Command {
  static #commandLineSafeStringRegex = /^[a-zA-Z0-9/._-]+$/;

  static #signals: NodeJS.Signals[] = [
    'SIGINT',
    'SIGTERM',
    'SIGHUP',
    'SIGQUIT',
    'SIGBREAK',
  ];

  static {
    Color.$.set('timestamp', Color.$.get('cyan'));
    Color.$.set('path', Color.$.get('yellow'));
    Color.$.set('command', Color.$.get('gray'));
    Color.$.set('duration', Color.$.get('gray'));
    Color.$.set('success', Color.$.get('green'));
    Color.$.set('failure', Color.$.get('red'));

    Logger.$.addHandler<Command>('command-start', {
      write: console.error,
      format: (_: Timestamp, command: Command): string => {
        return [
          Color.$.paint('timestamp', `[${command.stopwatch.startTime}]`),
          Color.$.paint('path', process.cwd()),
          `@ ${Color.$.paint('command', command.toString())}`,
        ].join(' ');
      },
    });

    Logger.$.addHandler<Command>('command-end', {
      write: console.error,
      format: (_: Timestamp, command: Command): string => {
        const exitCode = command.exitCode;
        return [
          Color.$.paint('timestamp', `[${command.stopwatch.stopTime}]`),
          Color.$.paint('duration', `${Duration.new(command.stopwatch.duration)}`),
          `(${Color.$.paint(exitCode === 0 ? 'success' : 'failure', exitCode.toString())})`,
          `@ ${Color.$.paint('command', command.toString())}`,
        ].join(' ');
      },
    });
  }

  static new(...args: ConstructorParameters<typeof Command>): Command {
    return new Command(...args);
  }

  #command: string = '';

  get command(): string {
    return this.#command;
  }

  #args: string[] = [];

  get args(): readonly string[] {
    return this.#args;
  }

  #stopwatch: Stopwatch = Stopwatch.new();

  get stopwatch(): Stopwatch {
    return this.#stopwatch;
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

  constructor(args: readonly string[]) {
    this.#command = args[0] ?? '';
    this.#args = args.slice(1);
  }

  #kill(signal: NodeJS.Signals) {
    if (this.#process != null && !this.#process.killed) {
      this.#process.kill(signal);
    }
  }

  #appendExceptionMessage(): Command {
    if (this.#exception != null) {
      this.#exception.error.message =
        this.#exception.error.message === ''
          ? this.toString()
          : `${this.#exception.error.message} @ ${this}`;
    }
    return this;
  }

  #setupExec<T = void>(hooks: ExecHooks<T>): T {
    this.#stopwatch.start();
    for (const signal of Command.#signals) {
      process.on(signal, this.#kill);
    }
    return hooks.onStart?.(this) as T;
  }

  #cleanupExec<T = void>(hooks: ExecHooks<T>, context: T) {
    this.#stopwatch.stop();
    for (const signal of Command.#signals) {
      process.off(signal, this.#kill);
    }
    hooks.onEnd?.(this, context);
  }

  async execAsync<T = void>(
    options: SpawnOptions = {},
    hooks: ExecHooks<T> = defaultExecHooks as any
  ): Promise<Command> {
    const context = this.#setupExec<T>(hooks);
    return new Promise((resolve) => {
      try {
        this.#process = undefined;
        this.#exception = undefined;

        if (this.#command === '') {
          this.#cleanupExec(hooks, context);
          return resolve(this);
        }

        this.#process = childProcessModule.spawn(this.command, this.args, {
          stdio: 'inherit',
          ...options,
        });

        this.#process.on('close', (exitCode, signalName) => {
          this.#stopwatch.stop();

          if (signalName != null) {
            this.#exception = Exception.new(`SignalException: ${signalName} @ ${this}`);
          } else if (exitCode !== 0) {
            this.#exception = Exception.new(`ExitCodeException: ${exitCode} @ ${this}`);
          }

          this.#cleanupExec(hooks, context);
          return resolve(this);
        });

        this.#process.on('error', (e) => {
          this.#stopwatch.stop();
          this.#exception = Exception.new(e);
          this.#appendExceptionMessage();

          this.#cleanupExec(hooks, context);
          return resolve(this);
        });
      } catch (e: unknown) {
        this.#stopwatch.stop();
        this.#exception = Exception.new(e);
        this.#appendExceptionMessage();

        this.#cleanupExec(hooks, context);
        return resolve(this);
      }
    });
  }

  throwIfException(): Command {
    if (this.#exception != null) {
      throw this.#exception;
    }

    return this;
  }

  exit() {
    process.exit(this.exitCode);
  }

  toString(): string {
    return [
      this.#command,
      ...this.#args.map((arg) =>
        Command.#commandLineSafeStringRegex.test(arg) ? arg : JSON.stringify(arg)
      ),
    ].join(' ');
  }
}
