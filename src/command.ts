import type { ChildProcess, SpawnOptions } from 'node:child_process';
import childProcessModule from 'node:child_process';
import { Color } from './color.js';
import { Duration } from './duration.js';
import { Exception } from './exception.js';
import { Logger } from './logger.js';
import { Stopwatch } from './stopwatch.js';
import type { Timestamp } from './timestamp.js';

export type ExecHooks = {
  onStart?: (command: Command) => any;
  onEnd?: (command: Command, context: any) => void;
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

    Logger.$.addHandler('command-start', {
      write: console.error,
      format: (_: Timestamp, command: Command): string => {
        return [
          Color.$.paint('timestamp', `[${command.stopwatch.startTime}]`),
          Color.$.paint('path', process.cwd()),
          `@ ${Color.$.paint('command', command.toString())}`,
        ].join(' ');
      },
    });

    Logger.$.addHandler('command-end', {
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

    return 1;
  }

  #exception: Exception | undefined;

  get exception(): Exception | undefined {
    return this.#exception;
  }

  constructor(args: readonly string[]) {
    this.#command = args[0] ?? '';
    this.#args = args.slice(1);
  }

  #appendExceptionMessage() {
    if (this.#exception != null) {
      this.#exception.error.message =
        this.#exception.error.message === ''
          ? this.toString()
          : `${this.#exception.error.message} @ ${this}`;
    }
  }

  #setupExec(hooks: ExecHooks): any {
    this.#stopwatch.start();
    for (const signal of Command.#signals) {
      process.on(signal, this.kill);
    }
    return hooks.onStart?.(this);
  }

  #cleanupExec(hooks: ExecHooks, context: any) {
    this.#stopwatch.stop();
    for (const signal of Command.#signals) {
      process.off(signal, this.kill);
    }
    hooks.onEnd?.(this, context);
  }

  async execAsync(
    options: SpawnOptions = {},
    hooks: ExecHooks = {
      onStart: (command) => Logger.$.write('command-start', command),
      onEnd: (command) => Logger.$.write('command-end', command),
    }
  ): Promise<Command> {
    const context = this.#setupExec(hooks);
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

        this.#process.on('close', (_, signalName) => {
          this.#stopwatch.stop();

          if (this.#exception == null) {
            if (signalName != null) {
              this.#exception = Exception.new(`SignalException: ${signalName} @ ${this}`);
              this.#exception.error.stack = this.#exception.error.message;
            }
          }

          this.#cleanupExec(hooks, context);
          resolve(this);
        });

        this.#process.on('error', (e) => {
          this.#stopwatch.stop();
          this.#exception = Exception.new(e);
          this.#appendExceptionMessage();
          this.#exception.error.stack = this.#exception.error.message;
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

  kill = (signal: NodeJS.Signals) => {
    if (this.#process != null && !this.#process.killed) {
      this.#process.kill(signal);
    }
  };

  throwIfException(): Command {
    if (this.#exception != null) {
      throw this.#exception.error;
    }

    return this;
  }

  exit() {
    if (this.#exception != null) {
      Logger.$.write('error', this.#exception.toString());
    }
    process.exit(this.exitCode);
  }

  exitIfFailure() {
    if (this.exitCode !== 0) {
      this.exit();
    }
    this.throwIfException();
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
