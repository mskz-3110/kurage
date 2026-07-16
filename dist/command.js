import childProcessModule from 'node:child_process';
import { Color } from './color.js';
import { Duration } from './duration.js';
import { Exception } from './exception.js';
import { Logger } from './logger.js';
import { Stopwatch } from './stopwatch.js';

var Command = class Command {
  static #commandLineSafeStringRegex = /^[a-zA-Z0-9/._-]+$/;
  static #signals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT', 'SIGBREAK'];
  static {
    Color.$.set('timestamp', Color.$.get('cyan'));
    Color.$.set('path', Color.$.get('yellow'));
    Color.$.set('command', Color.$.get('gray'));
    Color.$.set('duration', Color.$.get('gray'));
    Color.$.set('success', Color.$.get('green'));
    Color.$.set('failure', Color.$.get('red'));
    Logger.$.addHandler('command-start', {
      write: console.error,
      format: (_, command) => {
        return [
          Color.$.paint('timestamp', `[${command.stopwatch.startTime}]`),
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
          Color.$.paint('timestamp', `[${command.stopwatch.stopTime}]`),
          Color.$.paint('duration', `${Duration.new(command.stopwatch.duration)}`),
          `(${Color.$.paint(exitCode === 0 ? 'success' : 'failure', exitCode.toString())})`,
          `@ ${Color.$.paint('command', command.toString())}`,
        ].join(' ');
      },
    });
  }
  static new(...args) {
    return new Command(...args);
  }
  #command = '';
  get command() {
    return this.#command;
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
    this.#command = args[0] ?? '';
    this.#args = args.slice(1);
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
    return new Promise((resolve) => {
      try {
        this.#process = void 0;
        this.#exception = void 0;
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
      } catch (e) {
        this.#stopwatch.stop();
        this.#exception = Exception.new(e);
        this.#appendExceptionMessage();
        this.#cleanupExec(hooks, context);
        return resolve(this);
      }
    });
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
    this.throwIfException();
  }
  toString() {
    return [
      this.#command,
      ...this.#args.map((arg) =>
        Command.#commandLineSafeStringRegex.test(arg) ? arg : JSON.stringify(arg)
      ),
    ].join(' ');
  }
};

export { Command };
