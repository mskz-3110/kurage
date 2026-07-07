import kurage from '../kurage.js';

const packageJson = kurage.parsePackageJson();
console.log(
  JSON.stringify(
    {
      kurage: {
        version: packageJson.version,
        runtime: {
          name: kurage.runtime.name,
        },
      },
      process: {
        INIT_CWD: process.env.INIT_CWD,
        cwd: process.cwd(),
        argv: process.argv,
      },
    },
    null,
    2
  )
);
