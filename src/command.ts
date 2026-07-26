import type { ChildProcess, SpawnOptions, StdioOptions } from 'node:child_process';
import childProcessModule from 'node:child_process';
import { PassThrough } from 'node:stream';
import { Color } from './color.js';
import { Duration } from './duration.js';
import { Exception } from './exception.js';
import { Logger } from './logger.js';
import { Stopwatch } from './stopwatch.js';
import type { Time } from './time.js';

export type ExecHooks = {
  onStart?: (command: Command) => any;
  onEnd?: (command: Command, context: any) => void;
};

export class Stream extends PassThrough {
  static new(...args: ConstructorParameters<typeof PassThrough>): Stream {
    return new Stream(...args);
  }

  #buffer: Buffer = Buffer.alloc(0);

  get buffer(): Buffer {
    return this.#buffer;
  }

  constructor(...args: ConstructorParameters<typeof PassThrough>) {
    super(...args);
    const chunks: Buffer[] = [];
    this.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    this.on('close', () => {
      this.#buffer = Buffer.concat(chunks);
    });
  }
}

export class Command {
  static get stream(): typeof Stream {
    return Stream;
  }

  static #commandLineSafeStringRegex = /^[a-zA-Z0-9/._-]+$/;

  static #signals: NodeJS.Signals[] = [
    'SIGINT',
    'SIGTERM',
    'SIGHUP',
    'SIGQUIT',
    'SIGBREAK',
  ];

  static mergeStdio(
    options: SpawnOptions,
    overrideStdio: StdioOptions,
    defaultStdio: StdioOptions
  ): SpawnOptions {
    const mergedOptions = { ...options };
    if (!Object.hasOwn(mergedOptions, 'stdio')) {
      mergedOptions.stdio = defaultStdio;
      return mergedOptions;
    }

    if (!Array.isArray(mergedOptions.stdio)) {
      mergedOptions.stdio = [
        mergedOptions.stdio,
        mergedOptions.stdio,
        mergedOptions.stdio,
      ];
    }
    if (Array.isArray(overrideStdio)) {
      const mergedStdio = [...mergedOptions.stdio];
      overrideStdio.forEach((value, index) => {
        if (value != null) {
          mergedStdio[index] = value;
        }
      });
      mergedOptions.stdio = mergedStdio;
    }
    return mergedOptions;
  }

  static {
    Color.$.set('time', Color.$.get('cyan'));
    Color.$.set('path', Color.$.get('yellow'));
    Color.$.set('command', Color.$.get('gray'));
    Color.$.set('duration', Color.$.get('gray'));
    Color.$.set('success', Color.$.get('green'));
    Color.$.set('failure', Color.$.get('red'));

    Logger.$.addHandler('command-start', {
      write: console.error,
      format: (_: Time, command: Command): string => {
        return [
          Color.$.paint('time', `[${command.stopwatch.startTime}]`),
          Color.$.paint('path', process.cwd()),
          `@ ${Color.$.paint('command', command.toString())}`,
        ].join(' ');
      },
    });

    Logger.$.addHandler('command-end', {
      write: console.error,
      format: (_: Time, command: Command): string => {
        const exitCode = command.exitCode;
        return [
          Color.$.paint('time', `[${command.stopwatch.stopTime}]`),
          Color.$.paint(
            'duration',
            `${Duration.new(command.stopwatch.duration)}(${command.stopwatch.duration}ms)`
          ),
          `(${Color.$.paint(exitCode === 0 ? 'success' : 'failure', exitCode.toString())})`,
          `@ ${Color.$.paint('command', command.toString())}`,
        ].join(' ');
      },
    });
  }

  static new(...args: ConstructorParameters<typeof Command>): Command {
    return new Command(...args);
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
    this.#args = [...args];
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
    try {
      this.#process = undefined;
      this.#exception = undefined;

      if (this.#args.length === 0) {
        return this;
      }

      let stdout: Stream | undefined;
      let stderr: Stream | undefined;
      const mergedOptions = Command.mergeStdio(options, [], 'inherit');
      if (Array.isArray(mergedOptions.stdio)) {
        if (mergedOptions.stdio[1] instanceof Stream) {
          stdout = mergedOptions.stdio[1];
          mergedOptions.stdio[1] = 'pipe';
        }
        if (mergedOptions.stdio[2] instanceof Stream) {
          stderr = mergedOptions.stdio[2];
          mergedOptions.stdio[2] = 'pipe';
        }
      }
      this.#process = childProcessModule.spawn(
        this.#args[0]!,
        this.#args.slice(1),
        mergedOptions
      );

      if (this.#process.stdout != null && stdout != null) {
        this.#process.stdout.pipe(stdout);
      }
      if (this.#process.stderr != null && stderr != null) {
        this.#process.stderr.pipe(stderr);
      }

      await new Promise<void>((resolve) => {
        this.#process!.on('close', (_, signalName) => {
          this.#stopwatch.stop();
          if (this.#exception == null) {
            if (signalName != null) {
              this.#exception = Exception.new(`SignalException: ${signalName} @ ${this}`);
              this.#exception.error.stack = this.#exception.error.message;
            }
          }
          resolve();
        });

        this.#process!.on('error', (e) => {
          this.#stopwatch.stop();
          this.#exception = Exception.new(e);
          this.#appendExceptionMessage();
          this.#exception.error.stack = this.#exception.error.message;
          this.#process!.stdout?.destroy();
          this.#process!.stderr?.destroy();
          resolve();
        });
      });
    } catch (e: unknown) {
      this.#stopwatch.stop();
      this.#exception = Exception.new(e);
      this.#appendExceptionMessage();
    } finally {
      this.#cleanupExec(hooks, context);
    }
    return this;
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

  exitIfFailure(): Command {
    if (this.exitCode !== 0) {
      this.exit();
    }
    return this.throwIfException();
  }

  toString(): string {
    return this.#args
      .map((arg) =>
        Command.#commandLineSafeStringRegex.test(arg) ? arg : JSON.stringify(arg)
      )
      .join(' ');
  }
}
