#!/usr/bin/env node
import kurage from '../kurage.js';

const packageJson = kurage.parsePackageJson();
console.error(
  `\u001b[0m${packageJson.name}: \u001b[36mconst {${packageJson.name}} = await import('${packageJson.name}');\u001b[0m`
);
await kurage.$exit([...kurage.runtime.config.replArgs, ...process.argv.slice(2)], {}, {});
