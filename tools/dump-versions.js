#!/usr/bin/env node
const { kurage } = await import('kurage');

const commands = ['mise', 'node', 'bun', 'pnpm'];
const versions = {};

for (const command of commands) {
  versions[command] = (await kurage.$out([command, '--version'])) || null;
}

kurage.logger.out(JSON.stringify(versions, null, 2));
