import childProcessModule from 'node:child_process';
import { Color } from './color.js';
import { Exception } from './exception.js';
import { Stopwatch } from './stopwatch.js';
import { Timestamp } from './timestamp.js';

const defaultExecHooks = {
  onStart: (command) => {
    console.error(
      [
        Color.paint('cyan', `[${Timestamp.new()}]`),
        Color.paint('yellow', process.cwd()),
        `@ ${Color.paint('gray', command.toString())}`,
      ].join(' ')
    );
  },
  onEnd: (command) => {
    const exitCode = command.exitCode;
    console.error(
      [
        Color.paint('cyan', `[${Timestamp.new()}]`),
        Color.paint('gray', `${command.duration.toFixed(3)}s`),
        `(${Color.paint(exitCode === 0 ? 'green' : 'red', exitCode.toString())})`,
        `@ ${Color.paint('gray', command.toString())}`,
      ].join(' ')
    );
  },
};
var Command = class Command {
  static #commandLineSafeStringRegex = /^[a-zA-Z0-9/._-]+$/;
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
  get duration() {
    return this.#stopwatch.duration;
  }
  #process;
  get process() {
    return this.#process;
  }
  get exitCode() {
    if (this.#process != null && this.#process.exitCode != null) return this.#process.exitCode;
    return this.#exception != null ? 1 : 0;
  }
  #exception;
  get exception() {
    return this.#exception;
  }
  constructor(...args) {
    this.#command = args[0] ?? '';
    this.#args = args.slice(1);
  }
  #kill(signal) {
    if (this.#process != null && !this.#process.killed) this.#process.kill(signal);
  }
  #appendExceptionMessage() {
    if (this.#exception != null)
      this.#exception.error.message =
        this.#exception.error.message === '' ? this.toString() : `${this.#exception.error.message} @ ${this}`;
    return this;
  }
  async execAsync(options = {}, hooks = {}) {
    this.#stopwatch.start();
    const context = hooks.onStart?.(this);
    return new Promise((resolve) => {
      try {
        this.#process = void 0;
        this.#exception = void 0;
        if (this.#command === '') {
          this.#stopwatch.stop();
          hooks.onEnd?.(this, context);
          return resolve(this);
        }
        this.#process = childProcessModule.spawn(this.command, this.args, {
          stdio: 'inherit',
          ...options,
        });
        process.on('SIGINT', (signal) => this.#kill(signal));
        this.#process.on('close', (exitCode, signalName) => {
          this.#stopwatch.stop();
          if (signalName != null) this.#exception = Exception.new(`SignalException: ${signalName} @ ${this}`);
          else if (exitCode !== 0) this.#exception = Exception.new(`ExitCodeException: ${exitCode} @ ${this}`);
          process.off('SIGINT', this.#kill);
          hooks.onEnd?.(this, context);
          return resolve(this);
        });
        this.#process.on('error', (e) => {
          this.#stopwatch.stop();
          this.#exception = Exception.new(e);
          this.#appendExceptionMessage();
          process.off('SIGINT', this.#kill);
          hooks.onEnd?.(this, context);
          return resolve(this);
        });
      } catch (e) {
        this.#stopwatch.stop();
        this.#exception = Exception.new(e);
        this.#appendExceptionMessage();
        process.off('SIGINT', this.#kill);
        hooks.onEnd?.(this, context);
        return resolve(this);
      }
    });
  }
  throwIfException() {
    if (this.#exception != null) throw this.#exception;
  }
  exit() {
    process.exit(this.exitCode);
  }
  toString() {
    return [
      this.#command,
      ...this.#args.map((arg) => (Command.#commandLineSafeStringRegex.test(arg) ? arg : JSON.stringify(arg))),
    ].join(' ');
  }
};

export { Command, defaultExecHooks };
