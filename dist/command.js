import childProcessModule from 'node:child_process';
import { PassThrough } from 'node:stream';
import { buffer } from 'node:stream/consumers';
import { finished } from 'node:stream/promises';
import { Backtrace } from './backtrace.js';
import { Color } from './color.js';
import { Duration } from './duration.js';
import { Exception } from './exception.js';
import { Logger } from './logger.js';
import { Path } from './path.js';
import { Stopwatch } from './stopwatch.js';

var Stream = class Stream extends PassThrough {
  static new(...args) {
    return new Stream(...args);
  }
  #buffer;
  buffer() {
    this.#buffer ??= buffer(this);
    return this.#buffer;
  }
};
var Command = class Command {
  static get stream() {
    return Stream;
  }
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
    Color.set('time', Color.get('cyan'));
    Color.set('path', Color.get('yellow'));
    Color.set('command', Color.get('gray'));
    Color.set('duration', Color.get('gray'));
    Color.set('success', Color.get('green'));
    Color.set('failure', Color.get('red'));
    Logger.addHandler('command-start', {
      write: Logger.err,
      format: (_, command) => {
        return [
          Color.paint('time', `[${command.stopwatch.startTime}]`),
          Color.paint('path', process.cwd()),
          `@ ${Color.paint('command', command.toString())}`,
        ].join(' ');
      },
    });
    Logger.addHandler('command-end', {
      write: Logger.err,
      format: (_, command) => {
        const exitCode = command.exitCode;
        return [
          Color.paint('time', `[${command.stopwatch.stopTime}]`),
          Color.paint(
            'duration',
            `${Duration.new(command.stopwatch.duration)}(${command.stopwatch.duration}ms)`
          ),
          `(${Color.paint(exitCode === 0 ? 'success' : 'failure', exitCode.toString())})`,
          `@ ${Color.paint('command', command.toString())}`,
        ].join(' ');
      },
    });
  }
  static new(...args) {
    return new Command(...args);
  }
  static async loggingActionAsync(args, action) {
    const command = Command.new(args);
    command.#stopwatch.start();
    Logger.write('command-start', command);
    try {
      await action();
    } catch (e) {
      command.#exitCode = process.exitCode = 1;
      Logger.write('error', `UncaughtException: ${Exception.new(e).toString()}`);
    } finally {
      command.#stopwatch.stop();
      Logger.write('command-end', command);
    }
  }
  #args;
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
  #exitCode = 0;
  get exitCode() {
    if (this.#process != null && this.#process.exitCode != null)
      return this.#process.exitCode;
    return this.#exitCode;
  }
  #exception;
  get exception() {
    return this.#exception;
  }
  #caller;
  constructor(args) {
    this.#args = [...args];
  }
  #appendExceptionMessage() {
    this.#exception.error.message =
      this.#exception.error.message === ''
        ? this.toString()
        : `${this.#exception.error.message} @ ${this}`;
  }
  #setupExec(hooks, caller) {
    this.#stopwatch.start();
    this.#exitCode = 1;
    this.#caller = caller;
    for (const signal of Command.#signals) process.on(signal, this.kill);
    return hooks.onStart?.(this);
  }
  #cleanupExec(hooks, context, started) {
    this.#stopwatch.stop();
    for (const signal of Command.#signals) process.off(signal, this.kill);
    if (started) hooks.onEnd?.(this, context);
  }
  async execAsync(
    options = {},
    hooks = {
      onStart: (command) => Logger.write('command-start', command),
      onEnd: (command) => Logger.write('command-end', command),
    },
    caller
  ) {
    let context;
    let started = false;
    try {
      context = this.#setupExec(hooks, caller ?? Backtrace.caller(1));
      started = true;
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
      stdout?.resume();
      stderr?.resume();
      await new Promise((resolve) => {
        this.#process.once('close', (_, signalName) => {
          this.#stopwatch.stop();
          if (this.#exception == null) {
            if (signalName != null) {
              this.#exception = Exception.new(`SignalException: ${signalName} @ ${this}`);
              this.#exception.error.stack = this.#exception.error.message;
            }
          }
          resolve();
        });
        this.#process.once('error', (e) => {
          this.#stopwatch.stop();
          this.#exception = Exception.new(e);
          this.#appendExceptionMessage();
          this.#exception.error.stack = this.#exception.error.message;
          this.#process.stdout?.destroy();
          this.#process.stderr?.destroy();
          stdout?.end();
          stderr?.end();
          resolve();
        });
      });
      await Promise.all(
        [stdout, stderr]
          .filter((stream) => stream != null)
          .map((stream) => finished(stream))
      );
    } catch (e) {
      this.#stopwatch.stop();
      this.#exception = Exception.new(e);
      this.#appendExceptionMessage();
    } finally {
      this.#cleanupExec(hooks, context, started);
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
    if (this.#exception != null) Logger.write('error', this.#exception.toString());
    process.exit(this.exitCode);
  }
  exitIfFailure() {
    if (this.exitCode !== 0) this.exit();
    return this.throwIfException();
  }
  toString() {
    const strings = [];
    if (0 < this.#args.length)
      strings.push(`${this.#args[0]} |args|=${this.#args.length}`);
    if (this.#caller != null) {
      const file = this.#caller.getFileName();
      if (file != null && !Path.isBunfs(file))
        strings.push(`${file}:${this.#caller.getLineNumber()}`);
    }
    return strings.join(' in ');
  }
};

export { Command, Stream };
