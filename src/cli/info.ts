import kurage from '../kurage.js';

const packageJson = kurage.parsePackageJson();
console.log(
  JSON.stringify(
    {
      process: {
        INIT_CWD: process.env.INIT_CWD,
        cwd: process.cwd(),
        argv: process.argv,
      },
      kurage: {
        version: packageJson.version,
        runtime: kurage.runtime.name,
      },
    },
    null,
    2
  )
);
