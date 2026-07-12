import kurage from '../kurage.js';

if (0 < kurage.process.args.length) {
  await kurage.$exit(kurage.process.args);
}
