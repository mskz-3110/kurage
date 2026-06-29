import { Command } from './command.js';
import { Exception } from './exception.js';
import { Runtime } from './runtime.js';
export type PackageJson = {
  name: string;
  version: string;
  description: string;
};
export declare const kurage: {
  $: (...args: string[]) => Promise<void>;
  $command: (...args: string[]) => Promise<Command>;
  $exit: (...args: string[]) => Promise<void>;
  command: typeof Command;
  exception: typeof Exception;
  runtime: typeof Runtime;
  parsePackageJson: () => PackageJson;
};
export default kurage;
