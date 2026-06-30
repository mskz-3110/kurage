import kurage from '../kurage.js';

await kurage.$command(
  [kurage.runtime.name, ...process.argv.slice(3)],
  {},
  {
    onStart: (command) => {
      console.error(`[${(new Date()).toISOString()}] ${process.cwd()} @ ${command}`);
    },
    onEnd: (command) => {
      console.error(`[${(new Date()).toISOString()}] ${command.elapsedTime.toFixed(3)}ms @ ${command}`);
      command.exit();
    },
  }
);
