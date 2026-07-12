#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;
const { setTimeout } = await import('node:timers/promises');

const command = await kurage.$command(['kurage-not-found']);
if (command.exitCode === 0) {
  kurage.log('error', `Unexpected error: exitCode=${command.exitCode}`);
  process.exit(1);
}

await $.chdirAsync($.dirname($.urlToPath(import.meta.url)), async () => {
  const command = kurage.command.new(['./sleep.js', '3000']);
  const exec = command.execAsync();
  await setTimeout(1000);
  command.kill('SIGINT');
  await exec;
});
