#!/usr/bin/env node
const { kurage } = await import('kurage');

const argument = kurage.argument
  .new('deprecate')
  .command('<version>', 'Deprecate a published package version')
  .parse(kurage.process.args);
const [version, ...extraArgs] = argument.args;

await (async () => {
  const packageName = kurage.packageJson.name;
  let publishedVersions;
  try {
    publishedVersions = JSON.parse(await kurage.$out([
      'npm',
      'view',
      packageName,
      'versions',
      '--json',
    ]));
  } catch {
    argument.abort(`Could not retrieve published versions for ${packageName} from npm.`);
  }

  const availableVersions = [
    'Available versions:',
    ...publishedVersions.map((availableVersion) => `  ${availableVersion}`),
  ];

  if (!version || extraArgs.length > 0) {
    argument.abort(kurage.line.join(['A version is required.', ...availableVersions]));
  }

  if (!publishedVersions.includes(version)) {
    argument.abort(
      kurage.line.join([
        `${packageName}@${version} does not exist on npm.`,
        ...availableVersions,
      ])
    );
  }

  await kurage.$([
    'npm',
    'deprecate',
    `${packageName}@${version}`,
    'This version is deprecated. Please use the latest version.',
  ]);
})();
