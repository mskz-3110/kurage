#!/usr/bin/env node
import kurage from '../kurage.js';

if (0 < kurage.process.args.length)
  await kurage.$exit([kurage.runtime.name, ...kurage.process.args]);
