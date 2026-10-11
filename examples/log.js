#!/usr/bin/env node
const { kurage } = await import('kurage');

const names = ['debug', 'info', 'warn', 'error'];
for (const name of names) {
  kurage.log(name, [name]);
}
