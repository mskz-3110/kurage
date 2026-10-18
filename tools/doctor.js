#!/usr/bin/env node
const { kurage } = await import('kurage');

const $ = kurage.spellbook;
const requirements = JSON.parse($.read('package.json')).engines ?? {};
const commands = [
  ['mise', null],
  ['node', requirements.node],
  ['bun', requirements.bun],
  ['pnpm', requirements.pnpm],
];

function logFailure(message) {
  kurage.logger.err(kurage.color.paint('red', message));
}

function parseVersion(output) {
  const match = output.match(/(\d+)\.(\d+)\.(\d+)/);
  return match ? match.slice(1).map(Number) : null;
}

function satisfies(version, range) {
  if (!version || !range) return false;
  const match = range.match(/^>=\s*(\d+)(?:\.(\d+))?(?:\.(\d+))?$/);
  if (!match) return false;
  const minimum = [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
  for (let i = 0; i < minimum.length; i++) {
    if (version[i] !== minimum[i]) return version[i] > minimum[i];
  }
  return true;
}

let failed = false;
for (const [command, requirement] of commands) {
  const args =
    process.platform === 'win32' && command === 'pnpm'
      ? ['sh', '-c', 'pnpm --version']
      : [command, '--version'];
  if (!(await kurage.$ok(args))) {
    logFailure(
      `✗ ${command}: not found${requirement ? ` (required ${requirement})` : ''}`
    );
    failed = true;
    continue;
  }

  const output = await kurage.$out(args);
  if (!requirement) {
    kurage.logger.out(kurage.color.paint('green', `✓ ${command}: ${output}`));
    continue;
  }

  const version = parseVersion(output);
  if (satisfies(version, requirement)) {
    kurage.logger.out(
      kurage.color.paint('green', `✓ ${command}: ${output} (required ${requirement})`)
    );
  } else {
    logFailure(`✗ ${command}: ${output || 'unknown version'} (required ${requirement})`);
    failed = true;
  }
}

if (failed) {
  kurage.process.abort();
}
