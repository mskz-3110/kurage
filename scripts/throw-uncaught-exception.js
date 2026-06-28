#!/usr/bin/env node
process.on('uncaughtException', (e) => {
  console.error(e instanceof Error ? e.stack : String(e));
  process.exit(1);
});

throw new Error('Uncaught Exception');
