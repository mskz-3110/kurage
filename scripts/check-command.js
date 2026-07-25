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
  let args = [kurage.runtime.name];
  if (kurage.runtime.name === 'deno') {
    args.push('run');
    args.push('-A');
  }
  const command = kurage.command.new([...args, 'sleep.js', '3000']);
  const exec = command.execAsync();
  await setTimeout(1000);
  command.kill('SIGINT');
  await exec;
});
