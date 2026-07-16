import { defineConfig } from 'rolldown';

export default defineConfig({
  input: {
    'kurage': 'src/kurage.ts',
    'backtrace': 'src/backtrace.ts',
    'color': 'src/color.ts',
    'command': 'src/command.ts',
    'duration': 'src/duration.ts',
    'exception': 'src/exception.ts',
    'line': 'src/line.ts',
    'logger': 'src/logger.ts',
    'path': 'src/path.ts',
    'process': 'src/process.ts',
    'runtime': 'src/runtime.ts',
    'spellbook': 'src/spellbook.ts',
    'stopwatch': 'src/stopwatch.ts',
    'timestamp': 'src/timestamp.ts',
    'transcluder': 'src/transcluder.ts',
    'cli/kurage': 'src/cli/kurage.ts',
    'cli/exec': 'src/cli/exec.ts',
    'cli/info': 'src/cli/info.ts',
    'cli/repl': 'src/cli/repl.ts',
    'cli/run': 'src/cli/run.ts',
    'cli/txcl': 'src/cli/txcl.ts',
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
