import type { ChildProcess, StdioOptions } from 'node:child_process';
import childProcessModule from 'node:child_process';

export class Command {
  static #commandLineSafeStringRegex = /^[a-zA-Z0-9/._-]+$/;

  static new(...args: ConstructorParameters<typeof Command>): Command {
    return new Command(...args);
  }

  #command: string = '';

  get command(): string {
    return this.#command;
  }

  #args: string[] = [];

  get args(): string[] {
    return this.#args;
  }

  #process: ChildProcess | undefined;

  get process(): ChildProcess | undefined {
    return this.#process;
  }

  constructor(command: string, ...args: string[]) {
    this.#command = command;
    this.#args = args;
  }

  async execAsync(stdio: StdioOptions = 'inherit'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.#process = childProcessModule.spawn(this.command, this.args, { stdio });

        this.#process.on('close', (exitCode, signalName) => {
          if (signalName != null) {
            reject(new Error(`${signalName} @ ${this}`));
          } else if (exitCode !== 0) {
            reject(new Error(`${exitCode} @ ${this}`));
          } else {
            resolve();
          }
        });

        this.#process.on('error', (e) => {
          e.message = `${e.message} @ ${this}`;
          reject(e);
        });
      } catch (e: unknown) {
        if (e instanceof Error) {
          e.message = `${e.message} @ ${this}`;
        }
        reject(e);
      }
    });
  }

  toString(): string {
    return [
      this.#command,
      ...this.#args.map((arg) => (Command.#commandLineSafeStringRegex.test(arg) ? arg : JSON.stringify(arg))),
    ].join(' ');
  }
}
