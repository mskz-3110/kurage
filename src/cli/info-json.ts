import kurage from '../kurage.js';

console.log(
  JSON.stringify(
    {
      process: {
        versions: process.versions,
        INIT_CWD: process.env.INIT_CWD,
        cwd: process.cwd(),
        argv: process.argv,
      },
      kurage: {
        version: kurage.packageJson.version,
        runtime: kurage.runtime.name,
      },
    },
    null,
    2
  )
);
