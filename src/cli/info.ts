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
        argv: process.argv,
        versions: process.versions,
      },
    },
    null,
    2
  )
);
