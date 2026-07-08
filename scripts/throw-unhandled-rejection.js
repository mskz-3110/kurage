#!/usr/bin/env node
process.on('unhandledRejection', (reason) => {
  console.error(reason instanceof Error ? reason.stack : String(reason));
  process.exit(0);
});

Promise.reject(new Error('Unhandled Rejection'));
