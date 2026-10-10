#!/usr/bin/env node
const { kurage } = await import('kurage');

for (const string of kurage.process.args) {
  const duration = kurage.duration.parse(string);
  kurage.logger.out(`${duration}(${duration.ms}ms)`);
}
