import { defineConfig } from 'rolldown';

export default defineConfig({
  input: {
    'cli/kurage': 'src/cli/kurage.ts',
    'cli/kurage-repl': 'src/cli/kurage-repl.ts',
    'cli/kurage-exec': 'src/cli/kurage-exec.ts',
    'cli/kurage-run': 'src/cli/kurage-run.ts',
  },
  platform: 'node',
  resolve: {
    conditionNames: ['node', 'import'],
  },
  output: {
    dir: 'dist',
    format: 'esm',
    preserveModules: true,
    banner: (chunk) => chunk.fileName.startsWith('cli/') ? '#!/usr/bin/env node' : '',
  },
  external: (id) => !id.startsWith('.'),
  plugins: [
    {
      name: 'remove-region-comments',
      renderChunk(code) {
        return {
          code: code.replace(/\/\/#(re|endre)gion.*\n/g, ''),
          map: null,
        };
      },
    },
  ],
});
