import kurage from '../kurage.js';

await kurage.$(...[process.argv[0]!, ...process.argv.slice(3)]);
