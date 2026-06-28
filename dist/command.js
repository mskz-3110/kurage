import childProcessModule from 'node:child_process';

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
  constructor(...args) {
    this.#command = args[0] ?? '';
    this.#args = args.slice(1);
  }
  async execAsync(stdio = 'inherit', env = process.env) {
    return new Promise((resolve, reject) => {
      try {
        if (this.#command === '') return resolve();
        this.#process = childProcessModule.spawn(this.command, this.args, {
          stdio,
          env,
        });
        this.#process.on('close', (exitCode, signalName) => {
          if (signalName != null) return reject(/* @__PURE__ */ new Error(`${signalName} @ ${this}`));
          else if (exitCode !== 0) return reject(/* @__PURE__ */ new Error(`${exitCode} @ ${this}`));
          else return resolve();
        });
        this.#process.on('error', (e) => {
          e.message = `${e.message} @ ${this}`;
          return reject(e);
        });
      } catch (e) {
        if (e instanceof Error) e.message = `${e.message} @ ${this}`;
        return reject(e);
      }
    });
  }
  toString() {
    return [
      this.#command,
      ...this.#args.map((arg) => (Command.#commandLineSafeStringRegex.test(arg) ? arg : JSON.stringify(arg))),
    ].join(' ');
  }
};

export { Command };
