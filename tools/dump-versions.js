#!/usr/bin/env node
const { kurage } = await import('kurage');

const commands = ['mise', 'node', 'bun', 'pnpm'];
const versions = {};

for (const command of commands) {
  const args = [command, '--version'];
  versions[command] = (await kurage.$out(args)) || null;
}

kurage.logger.out(JSON.stringify(versions, null, 2));
