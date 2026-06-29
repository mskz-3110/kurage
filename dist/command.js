import childProcessModule from 'node:child_process';
import { Exception } from './exception.js';

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
  async execAsync({ stdio = 'inherit', ...others } = {}) {
    return new Promise((resolve) => {
      try {
        this.#process = void 0;
        this.#exception = void 0;
        if (this.#command === '') return resolve(this);
        this.#process = childProcessModule.spawn(this.command, this.args, {
          stdio,
          ...others,
        });
        this.#process.on('close', (exitCode, signalName) => {
          if (signalName != null) {
            this.#exception = Exception.new(`SignalException: ${signalName} @ ${this}`);
            return resolve(this);
          }
          if (exitCode !== 0) {
            this.#exception = Exception.new(`ExitCodeException: ${exitCode} @ ${this}`);
            return resolve(this);
          }
          return resolve(this);
        });
        this.#process.on('error', (e) => {
          this.#exception = Exception.new(e).appendMessage(` @ ${this}`);
          return resolve(this);
        });
      } catch (e) {
        this.#exception = Exception.new(e).appendMessage(` @ ${this}`);
        return resolve(this);
      }
    });
  }
  throw() {
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
