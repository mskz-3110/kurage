import kurage from '../kurage.js';

let args = ['node', '-i'];
if (typeof (globalThis as any).Deno !== 'undefined') {
  args = ['deno', 'repl'];
} else if (process.versions.bun) {
  args = ['bun', 'repl'];
}

const packageJson = kurage.parsePackageJson();
console.error(
  `\u001b[0m${packageJson.name}: \u001b[36mconst {${packageJson.name}} = await import('${packageJson.name}');\u001b[0m`
);

await kurage.$(...args);
