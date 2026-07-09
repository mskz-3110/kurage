#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;

kurage.log('debug', process.cwd());
await $.mkdirAsync(kurage.path.join([$.tmpdir(), 'kurage']), async () => {
  kurage.log('debug', process.cwd());
  const path = $.absolute('test.txt');
  console.log(JSON.stringify({
    dirname: $.dirname(path),
    filename: $.filename(path),
    extname: $.extname(path),
    basename: $.basename(path),
  }, null, 2));
  if (!$.exists(path)) {
    $.write(path, 'あいうえお\nかきくけこ\n');
  }
  console.log($.glob('*.txt'));
  $.assertEqual($.read(path).trim(), (await $.readlinesAsync(path)).join('\n'));
  await kurage.$(['cat', path]);
});
kurage.log('debug', process.cwd());
