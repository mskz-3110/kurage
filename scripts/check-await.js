#!/usr/bin/env node
const { setTimeout } = await import('node:timers/promises');

console.log('1');
await setTimeout(1000);
console.log('2');
