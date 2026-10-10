const { kurage } = await import('kurage');
const $ = kurage.spellbook;

let scripts = kurage.process.args;
if (scripts.length === 0) {
  const __FILE__ = $.urlToPath(import.meta.url);
  const basename = $.basename(__FILE__);
  scripts = $.glob(kurage.path.join([$.dirname(__FILE__), '**', '*.js']), {
    exclude: (path) => path === basename,
  });
}

for (const name of kurage.runtime.names) {
  if (!(await kurage.$ok(['which', name]))) {
    continue;
  }

  console.error(kurage.color.paint('magenta', `<${name}>`));
  for (const script of scripts) {
    await kurage.$([name, script]);
  }
}
