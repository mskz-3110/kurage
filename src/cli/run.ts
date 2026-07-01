import kurage from '../kurage.js';

await kurage.$exit([kurage.runtime.name, ...process.argv.slice(3)]);
