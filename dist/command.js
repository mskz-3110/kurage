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
  constructor(command, ...args) {
    this.#command = command;
    this.#args = args;
  }
  async execAsync(stdio = 'inherit') {
    return new Promise((resolve, reject) => {
      try {
        this.#process = childProcessModule.spawn(this.command, this.args, { stdio });
        this.#process.on('close', (exitCode, signalName) => {
          if (signalName != null) reject(/* @__PURE__ */ new Error(`${signalName} @ ${this}`));
          else if (exitCode !== 0) reject(/* @__PURE__ */ new Error(`${exitCode} @ ${this}`));
          else resolve();
        });
        this.#process.on('error', (e) => {
          e.message = `${e.message} @ ${this}`;
          reject(e);
        });
      } catch (e) {
        if (e instanceof Error) e.message = `${e.message} @ ${this}`;
        reject(e);
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
