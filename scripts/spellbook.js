#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;

kurage.log('debug', process.cwd());
await $.chdirAsync('/tmp', async () => {
  kurage.log('debug', process.cwd());
  await $.mkdirAsync('kurage', async () => {
    kurage.log('debug', process.cwd());
    const path1 = '01.txt';
    const path2 = '02.txt';
    const path3 = '03.txt';
    $.write(path1, 'あいうえお\n');
    $.copy(path1, path2);
    $.append(path2, 'かきくけこ\n');
    $.move(path2, path3);
    $.append(path3, 'さしすせそ\n');
    console.log($.glob('*.txt'));
    $.assertEqual($.read(path3).trim(), (await $.readlinesAsync(path3)).join('\n'));
    $.remove(path2);
    const path = kurage.path.absolute(path3);
    console.log(JSON.stringify({
      dirname: $.dirname(path),
      filename: $.filename(path),
      extname: $.extname(path),
      basename: $.basename(path),
    }, null, 2));
  });
});
kurage.log('debug', process.cwd());
