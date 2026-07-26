import childProcessModule from 'node:child_process';
import { PassThrough } from 'node:stream';
import { Color } from './color.js';
import { Duration } from './duration.js';
import { Exception } from './exception.js';
import { Logger } from './logger.js';
import { Stopwatch } from './stopwatch.js';

var Stream = class Stream extends PassThrough {
  static new(...args) {
    return new Stream(...args);
  }
  #buffer = Buffer.alloc(0);
  get buffer() {
    return this.#buffer;
  }
  constructor(...args) {
    super(...args);
    const chunks = [];
    this.on('data', (chunk) => {
      chunks.push(chunk);
    });
    this.on('close', () => {
      this.#buffer = Buffer.concat(chunks);
    });
  }
};
var Command = class Command {
  static get stream() {
    return Stream;
  }
  static #commandLineSafeStringRegex = /^[a-zA-Z0-9/._-]+$/;
  static #signals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT', 'SIGBREAK'];
  static mergeStdio(options, overrideStdio, defaultStdio) {
    const mergedOptions = { ...options };
    if (!Object.hasOwn(mergedOptions, 'stdio')) {
      mergedOptions.stdio = defaultStdio;
      return mergedOptions;
    }
    if (!Array.isArray(mergedOptions.stdio))
      mergedOptions.stdio = [
        mergedOptions.stdio,
        mergedOptions.stdio,
        mergedOptions.stdio,
      ];
    if (Array.isArray(overrideStdio)) {
      const mergedStdio = [...mergedOptions.stdio];
      overrideStdio.forEach((value, index) => {
        if (value != null) mergedStdio[index] = value;
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
      format: (_, command) => {
        return [
          Color.$.paint('time', `[${command.stopwatch.startTime}]`),
          Color.$.paint('path', process.cwd()),
          `@ ${Color.$.paint('command', command.toString())}`,
        ].join(' ');
      },
    });
    Logger.$.addHandler('command-end', {
      write: console.error,
      format: (_, command) => {
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
  static new(...args) {
    return new Command(...args);
  }
  #args = [];
  get args() {
    return this.#args;
  }
  #stopwatch = Stopwatch.new();
  get stopwatch() {
    return this.#stopwatch;
  }
  #process;
  get process() {
    return this.#process;
  }
  get exitCode() {
    if (this.#process != null && this.#process.exitCode != null)
      return this.#process.exitCode;
    return 1;
  }
  #exception;
  get exception() {
    return this.#exception;
  }
  constructor(args) {
    this.#args = [...args];
  }
  #appendExceptionMessage() {
    if (this.#exception != null)
      this.#exception.error.message =
        this.#exception.error.message === ''
          ? this.toString()
          : `${this.#exception.error.message} @ ${this}`;
  }
  #setupExec(hooks) {
    this.#stopwatch.start();
    for (const signal of Command.#signals) process.on(signal, this.kill);
    return hooks.onStart?.(this);
  }
  #cleanupExec(hooks, context) {
    this.#stopwatch.stop();
    for (const signal of Command.#signals) process.off(signal, this.kill);
    hooks.onEnd?.(this, context);
  }
  async execAsync(
    options = {},
    hooks = {
      onStart: (command) => Logger.$.write('command-start', command),
      onEnd: (command) => Logger.$.write('command-end', command),
    }
  ) {
    const context = this.#setupExec(hooks);
    try {
      this.#process = void 0;
      this.#exception = void 0;
      if (this.#args.length === 0) return this;
      let stdout;
      let stderr;
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
        this.#args[0],
        this.#args.slice(1),
        mergedOptions
      );
      if (this.#process.stdout != null && stdout != null)
        this.#process.stdout.pipe(stdout);
      if (this.#process.stderr != null && stderr != null)
        this.#process.stderr.pipe(stderr);
      await new Promise((resolve) => {
        this.#process.on('close', (_, signalName) => {
          this.#stopwatch.stop();
          if (this.#exception == null) {
            if (signalName != null) {
              this.#exception = Exception.new(`SignalException: ${signalName} @ ${this}`);
              this.#exception.error.stack = this.#exception.error.message;
            }
          }
          resolve();
        });
        this.#process.on('error', (e) => {
          this.#stopwatch.stop();
          this.#exception = Exception.new(e);
          this.#appendExceptionMessage();
          this.#exception.error.stack = this.#exception.error.message;
          this.#process.stdout?.destroy();
          this.#process.stderr?.destroy();
          resolve();
        });
      });
    } catch (e) {
      this.#stopwatch.stop();
      this.#exception = Exception.new(e);
      this.#appendExceptionMessage();
    } finally {
      this.#cleanupExec(hooks, context);
    }
    return this;
  }
  kill = (signal) => {
    if (this.#process != null && !this.#process.killed) this.#process.kill(signal);
  };
  throwIfException() {
    if (this.#exception != null) throw this.#exception.error;
    return this;
  }
  exit() {
    if (this.#exception != null) Logger.$.write('error', this.#exception.toString());
    process.exit(this.exitCode);
  }
  exitIfFailure() {
    if (this.exitCode !== 0) this.exit();
    return this.throwIfException();
  }
  toString() {
    return this.#args
      .map((arg) =>
        Command.#commandLineSafeStringRegex.test(arg) ? arg : JSON.stringify(arg)
      )
      .join(' ');
  }
};

export { Command, Stream };
