const { kurage } = await import('kurage');
const $ = kurage.spellbook;

let files = kurage.process.args;
if (files.length === 0) {
  const __FILE__ = $.urlToPath(import.meta.url);
  const basename = $.basename(__FILE__);
  files = $.glob(kurage.path.join([$.dirname(__FILE__), '**', '*.js']), {
    exclude: (path) => path === basename,
  });
}

for (const name of kurage.runtime.names) {
  if (!(await kurage.$ok(['which', name]))) {
    continue;
  }

  kurage.logger.err(kurage.color.paint('magenta', `<${name}>`));
  for (const script of files) {
    await kurage.$([name, script]);
  }
}
