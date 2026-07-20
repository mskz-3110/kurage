import kurage from '../kurage.js';

export async function execAsync() {
  if (0 < kurage.process.args.length) {
    await kurage.$exit(kurage.process.args);
  }
}

if (import.meta.main) {
  await execAsync();
}
