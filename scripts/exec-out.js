#!/usr/bin/env node
const { kurage } = await import('kurage');

console.log(JSON.stringify(await kurage.$out(['node', '-p', 'process.env.LANG'])));
