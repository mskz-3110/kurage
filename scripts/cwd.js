#!/usr/bin/env node
const { kurage } = await import('kurage');

console.log(JSON.stringify({
  INIT_CWD: process.env.INIT_CWD,
  cwd: process.cwd(),
}, null, 2));
