#!/usr/bin/env node
import kurage from '../kurage.js';

const packageJson = kurage.parsePackageJson();
console.error(
  `${kurage.color.get('reset')}${packageJson.name}: ${kurage.color.paint('cyan', `const {${packageJson.name}} = await import('${packageJson.name}');`)}`
);
await kurage.$exit([...kurage.runtime.config.replArgs, ...process.argv.slice(2)], {}, {});
