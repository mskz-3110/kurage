#!/usr/bin/env node
import kurage from '../kurage.js';

await kurage.$exit(kurage.process.args);
