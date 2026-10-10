import kurage from '../kurage.js';

export async function txclAsync() {
  const $ = kurage.spellbook;
  const transcluder = kurage.transcluder.new();
  const args = kurage.process.args;
  if (args.length === 0) {
    const lines = process.stdin.isTTY ? [] : await $.readStreamLinesAsync(process.stdin);
    const replacedLines = await transcluder.transcludeLinesAsync(process.cwd(), lines);
    if (kurage.transcluder.equals(lines, replacedLines)) {
      kurage.logger.err(kurage.color.paint('gray', `Skipped`));
    } else {
      kurage.logger.err(kurage.color.paint('cyan', `Updated`));
    }
    kurage.logger.out(kurage.line.join(replacedLines));
    process.exit(0);
  }

  for (const path of kurage.process.args) {
    if (await transcluder.transcludeFileAsync(path)) {
      kurage.logger.err(kurage.color.paint('cyan', `Updated: ${path}`));
    } else {
      kurage.logger.err(kurage.color.paint('gray', `Skipped: ${path}`));
    }
  }
}

if (import.meta.main) {
  await txclAsync();
}
