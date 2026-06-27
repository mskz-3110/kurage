import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export type PackageJson = {
  name: string;
  version: string;
  description: string;
};

process.on('uncaughtException', (e) => {
  console.error(`Uncaught Exception: ${e instanceof Error ? e.message : String(e)}`);
});

process.on('unhandledRejection', (reason) => {
  console.error(`Unhandled Rejection: ${reason instanceof Error ? reason.message : String(reason)}`);
});

const getPackageJson = (): PackageJson =>
  JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')) as PackageJson;

export const kurage = {
  getPackageJson,
};

export default kurage;
