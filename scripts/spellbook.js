#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;

kurage.log('debug', process.cwd());
$.chdir('/tmp', () => {
  kurage.log('debug', process.cwd());
  $.mkdir('kurage', () => {
    kurage.log('debug', process.cwd());
  });
});
kurage.log('debug', process.cwd());
