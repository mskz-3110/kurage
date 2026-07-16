#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;

await $.mkdirAsync(kurage.path.join([await $.tmpdirAsync(), 'kurage']), async () => {
  let path = $.absolute('test.txt');
  console.log(JSON.stringify({
    dirname: $.dirname(path),
    filename: $.filename(path),
    extname: $.extname(path),
    basename: $.basename(path),
  }, null, 2));
  path = $.basename(path);

  if (!$.exists(path)) {
    $.write(path, 'あいうえお\nかきくけこ\n');
  }

  $.assertEqual($.read(path).trim(), (await $.readLinesAsync(path)).join('\n'));
  await kurage.$(['cat', path]);
});
