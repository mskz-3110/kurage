#!/usr/bin/env node
import kurage from '../kurage.js';

await kurage.$exit(process.argv.slice(3));
