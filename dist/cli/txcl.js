#!/usr/bin/env node
import kurage from '../kurage.js';

const $ = kurage.spellbook;
const transcluder = kurage.transcluder.new();
if (kurage.process.args.length === 0) {
  const lines = process.stdin.isTTY ? [] : await $.readStreamLinesAsync(process.stdin);
  const replacedLines = await transcluder.transcludeLinesAsync(process.cwd(), lines);
  if (kurage.transcluder.equals(lines, replacedLines))
    console.error(kurage.color.$.paint('gray', `Skipped`));
  else console.error(kurage.color.$.paint('cyan', `Updated`));
  console.log(kurage.line.join(replacedLines));
  process.exit(0);
}
for (const path of kurage.process.args)
  if (await transcluder.transcludeFileAsync(path))
    console.error(kurage.color.$.paint('cyan', `Updated: ${path}`));
  else console.error(kurage.color.$.paint('gray', `Skipped: ${path}`));
