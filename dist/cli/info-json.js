#!/usr/bin/env node
import kurage from '../kurage.js';

async function infoJsonAsync() {
  kurage.logger.out(
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
          runtime: kurage.runtimeName,
        },
      },
      null,
      2
    )
  );
}
if (import.meta.main) await infoJsonAsync();

export { infoJsonAsync };
