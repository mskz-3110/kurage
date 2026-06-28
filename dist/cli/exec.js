#!/usr/bin/env node
import kurage from '../kurage.js';

await kurage.$(...process.argv.slice(3));
