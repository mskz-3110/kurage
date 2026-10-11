#!/usr/bin/env node
const { kurage } = await import('kurage');
const { inspect } = await import('node:util');

const offset = parseInt(kurage.process.args[0] ?? '0', 10) || 0;
kurage.logger.out(inspect({ offset }));

kurage.logger.out(kurage.backtrace.new(offset).toString());
kurage.logger.out('');

const checkAsync = async () => {
  kurage.logger.out(new kurage.backtrace(offset).toString());
};
await checkAsync();
