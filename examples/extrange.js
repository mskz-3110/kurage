#!/usr/bin/env node
import { kurage } from '../dist/kurage.js';

const $ = kurage.spellbook;

function printRange(lines, start, end, invert) {
  const startIndex = $.findIndex(lines, (line) => line === start);
  if (startIndex < 0) return;

  const endIndex = $.findIndex(lines, (line) => line === end, startIndex + 1);
  if (endIndex < 0) return;

  for (const line of $.sliceRange(lines, startIndex, endIndex, invert)) {
    kurage.logger.out(line);
  }
}

const options = kurage.argument
  .new('extrange')
  .requiredOption('-s, --start <TEXT>', 'Start marker')
  .requiredOption('-e, --end <TEXT>', 'End marker')
  .requiredOption('-f, --file <PATH>', 'Input file')
  .option('-v, --invert', 'Print lines outside the range', false)
  .parse(kurage.process.args).options;
printRange(
  await $.readLinesAsync(options.file),
  options.start,
  options.end,
  options.invert
);
