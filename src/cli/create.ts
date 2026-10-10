import kurage from '../kurage.js';

export async function createAsync() {
  const code = kurage.line.join(
    kurage.line.split(
      `
#!/usr/bin/env node
const { kurage } = await import('kurage');
const $ = kurage.spellbook;

${kurage.line.join(process.stdin.isTTY ? [] : await kurage.spellbook.readStreamLinesAsync(process.stdin))}
`.trim()
    )
  );
  if (0 < kurage.process.args.length) {
    kurage.spellbook.write(kurage.process.args[0]!, code);
  } else {
    console.log(code);
  }
}

if (import.meta.main) {
  await createAsync();
}
