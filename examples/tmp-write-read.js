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

  await kurage.$(['ls']);
  if (!$.exists(path)) {
    $.write(path, `あいうえお${kurage.line.eol}かきくけこ`);
  }

  const lines = await $.readLinesAsync(path);
  lines.push('');
  $.assertEqual($.read(path), kurage.line.join(lines), 'Mismatch');
  await kurage.$(['cat', path]);
});
