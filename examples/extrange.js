#!/usr/bin/env node
import { kurage } from '../dist/kurage.js';

const $ = kurage.spellbook;
const options = kurage.argument
  .new('extrange')
  .requiredOption('-s, --start <TEXT>', 'Start marker')
  .requiredOption('-e, --end <TEXT>', 'End marker')
  .requiredOption('-f, --file <PATH>', 'Input file')
  .option('-v, --invert', 'Print lines outside the range', false)
  .parse(kurage.process.args).options;
kurage.logger.out(
  kurage.line.join(
    await $.extrangeAsync(
      await $.readLinesAsync(options.file),
      options.start,
      options.end,
      options.invert
    )
  )
);
