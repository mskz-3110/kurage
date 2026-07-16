import kurage from '../kurage.js';

for (const path of kurage.process.args) {
  if (await kurage.transcluder.new().transcludeFileAsync(path)) {
    console.log(kurage.color.$.paint('cyan', `Updated: ${path}`));
  } else {
    console.log(kurage.color.$.paint('gray', `Skipped: ${path}`));
  }
}
