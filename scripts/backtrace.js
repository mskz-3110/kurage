const { kurage } = await import('kurage');
const { inspect } = await import('node:util');

const offset = parseInt(kurage.process.args[0] ?? '0', 10) || 0;
console.log(inspect({ offset }));

console.log(kurage.backtrace.new(offset).toString());
console.log('');

const checkAsync = async () => {
  console.log(new kurage.backtrace(offset).toString());
};
await checkAsync();
