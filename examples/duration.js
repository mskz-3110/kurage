#!/usr/bin/env node
const { kurage } = await import('kurage');

for (const string of kurage.process.args) {
  const duration = kurage.duration.parse(string);
  console.log(`${duration}(${duration.ms}ms)`);
}
