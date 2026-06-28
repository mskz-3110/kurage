import kurage from '../kurage.js';

const packageJson = kurage.parsePackageJson();

console.log(
  JSON.stringify(
    {
      kurage: {
        version: packageJson.version,
      },
      process: {
        argv: process.argv,
      },
    },
    null,
    2
  )
);
