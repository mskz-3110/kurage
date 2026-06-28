import { Command } from './command.js';
export type PackageJson = {
  name: string;
  version: string;
  description: string;
};
export declare const kurage: {
  $: (...args: string[]) => Promise<void>;
  command: typeof Command;
  parsePackageJson: () => PackageJson;
};
export default kurage;
