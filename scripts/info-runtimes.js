#!/usr/bin/env node
import kurage from 'kurage';

const runtimeNames = ['node', 'bun', 'deno'];

for (const runtimeName of runtimeNames) {
  console.log(`[${runtimeName}]`);
  await kurage.$(...[runtimeName, 'dist/cli/kurage.js']);
}
