import type { SpawnOptions } from 'node:child_process';
import kurage from '../kurage.js';

const packageJson = kurage.parsePackageJson();
const replCodes = [
  `const { ${packageJson.name} } = await import('${packageJson.name}');`,
  `const $ = ${packageJson.name}.spellbook;`,
];
const options: SpawnOptions = { stdio: ['pipe', 'inherit', 'inherit'] };
let args = kurage.runtime.config.replArgs;
if (kurage.runtime.name === 'deno') {
  if (await kurage.$which('script')) {
    args = ['script', '-qec', args.join(' '), '/dev/null'];
  } else {
    options.stdio = 'inherit';
  }
}
const command = kurage.command.new(args);
const exec = command.execAsync(options);
if (command.process != null && command.process.stdin != null) {
  command.process.stdin.write(`${replCodes.join('')}\n`);
  process.stdin.pipe(command.process.stdin);
  process.stdin.setRawMode(true);
} else {
  console.error(kurage.color.$.paint('cyan', replCodes.join('\n')));
}
(await exec).exit();
