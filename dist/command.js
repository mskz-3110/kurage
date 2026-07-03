import childProcessModule from 'node:child_process';
import { Color } from './color.js';
import { Duration } from './duration.js';
import { Exception } from './exception.js';
import { Logger } from './logger.js';
import { Stopwatch } from './stopwatch.js';

const defaultExecHooks = {
  onStart: (command) => Logger.logger.write('command-start', [command]),
  onEnd: (command) => Logger.logger.write('command-end', [command]),
};
var Command = class Command {
  static #commandLineSafeStringRegex = /^[a-zA-Z0-9/._-]+$/;
  static #signals = ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT', 'SIGBREAK'];
  static {
    Logger.logger.addHandler('command-start', {
      write: console.error,
      format: (payload) => {
        const command = payload.args[0];
        return [
          Color.paint('cyan', `[${command.stopwatch.startTime}]`),
          Color.paint('yellow', process.cwd()),
          `@ ${Color.paint('gray', command.toString())}`,
        ].join(' ');
      },
    });
    Logger.logger.addHandler('command-end', {
      write: console.error,
      format: (payload) => {
        const command = payload.args[0];
        const exitCode = command.exitCode;
        return [
          Color.paint('cyan', `[${command.stopwatch.stopTime}]`),
          Color.paint('gray', `${Duration.new(command.stopwatch.duration)}`),
          `(${Color.paint(exitCode === 0 ? 'green' : 'red', exitCode.toString())})`,
          `@ ${Color.paint('gray', command.toString())}`,
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
  #setupExec(hooks) {
    this.#stopwatch.start();
    for (const signal of Command.#signals) process.on(signal, () => this.#kill(signal));
    return hooks.onStart?.(this);
  }
  #cleanupExec(hooks, context) {
    this.#stopwatch.stop();
    for (const signal of Command.#signals) process.off(signal, this.#kill);
    hooks.onEnd?.(this, context);
  }
  async execAsync(options = {}, hooks = {}) {
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
        this.#process.on('close', (exitCode, signalName) => {
          this.#stopwatch.stop();
          if (signalName != null) this.#exception = Exception.new(`SignalException: ${signalName} @ ${this}`);
          else if (exitCode !== 0) this.#exception = Exception.new(`ExitCodeException: ${exitCode} @ ${this}`);
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
      } catch (e) {
        this.#stopwatch.stop();
        this.#exception = Exception.new(e);
        this.#appendExceptionMessage();
        this.#cleanupExec(hooks, context);
        return resolve(this);
      }
    });
  }
  throwIfException() {
    if (this.#exception != null) throw this.#exception;
    return this;
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
