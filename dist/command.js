import childProcessModule from 'node:child_process';
import { Exception } from './exception.js';
import { Stopwatch } from './stopwatch.js';

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
  get elapsedTime() {
    return this.#stopwatch.elapsedTime;
  }
  #process;
  get process() {
    return this.#process;
  }
  #exception;
  get exception() {
    return this.#exception;
  }
  constructor(...args) {
    this.#command = args[0] ?? '';
    this.#args = args.slice(1);
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
        this.#process.on('close', (exitCode, signalName) => {
          if (signalName != null) this.#exception = Exception.new(`SignalException: ${signalName} @ ${this}`);
          else if (exitCode !== 0) this.#exception = Exception.new(`ExitCodeException: ${exitCode} @ ${this}`);
          this.#stopwatch.stop();
          hooks.onEnd?.(this, context);
          return resolve(this);
        });
        this.#process.on('error', (e) => {
          this.#exception = Exception.new(e);
          this.#appendExceptionMessage();
          this.#stopwatch.stop();
          hooks.onEnd?.(this, context);
          return resolve(this);
        });
      } catch (e) {
        this.#exception = Exception.new(e);
        this.#appendExceptionMessage();
        this.#stopwatch.stop();
        hooks.onEnd?.(this, context);
        return resolve(this);
      }
    });
  }
  throwIfException() {
    if (this.#exception != null) throw this.#exception;
  }
  exit() {
    let exitCode = this.#exception != null ? 1 : 0;
    if (this.#process != null && this.#process.exitCode != null) exitCode = this.#process.exitCode;
    process.exit(exitCode);
  }
  toString() {
    return [
      this.#command,
      ...this.#args.map((arg) => (Command.#commandLineSafeStringRegex.test(arg) ? arg : JSON.stringify(arg))),
    ].join(' ');
  }
};

export { Command };
