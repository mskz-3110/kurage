import type { ChildProcess, SpawnOptions } from 'node:child_process';
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

  constructor(...args: string[]) {
    this.#command = args[0] ?? '';
    this.#args = args.slice(1);
  }

  async execAsync({ stdio = 'inherit', ...others }: SpawnOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.#command === '') {
          return resolve();
        }

        this.#process = childProcessModule.spawn(this.command, this.args, { stdio, ...others });

        this.#process.on('close', (exitCode, signalName) => {
          if (signalName != null) {
            return reject(new Error(`${signalName} @ ${this}`));
          } else if (exitCode !== 0) {
            return reject(new Error(`${exitCode} @ ${this}`));
          } else {
            return resolve();
          }
        });

        this.#process.on('error', (e) => {
          e.message = `${e.message} @ ${this}`;
          return reject(e);
        });
      } catch (e: unknown) {
        if (e instanceof Error) {
          e.message = `${e.message} @ ${this}`;
        }
        return reject(e);
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
