#!/usr/bin/env node
import kurage from '../kurage.js';

const packageJson = kurage.parsePackageJson();
console.log(
  JSON.stringify(
    {
      kurage: {
        version: packageJson.version,
        runtime: {
          name: kurage.runtime.name,
          config: kurage.runtime.config,
        },
      },
      process: {
        versions: process.versions,
        argv: process.argv,
      },
    },
    null,
    2
  )
);
