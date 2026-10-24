#!/usr/bin/env node
const { kurage } = await import('kurage');

const $ = kurage.spellbook;
const project = $.absolute(
  kurage.path.join([$.dirname($.urlToPath(import.meta.url)), '..'])
);
const isWindows = process.platform === 'win32';
const actions = new Map([
  ['install', installAsync],
  ['uninstall', uninstallAsync],
]);
const rcPaths = {
  bash: kurage.path.join([process.env.HOME, '.bashrc']),
  zsh: kurage.path.join([process.env.HOME, '.zshrc']),
};
const localMise = kurage.path.join([process.env.HOME, '.local', 'bin', 'mise']);
const installerUrls = {
  direnv: 'https://direnv.net/install.sh',
  mise: 'https://mise.run',
};

async function installActionAsync(name, action) {
  const installer = kurage.path.join([
    await $.tmpdirAsync(),
    `kurage-${name}-install-${$.uuid()}.sh`,
  ]);
  try {
    await action(installer);
  } finally {
    $.remove(installer);
  }
}

async function updateRcActionAsync(path, name, action) {
  if (!$.exists(path)) {
    return false;
  }

  const lines = await $.readLinesAsync(path);
  const builder = kurage.line.builder.new(lines);
  await action(builder, `# kurage-${name}-start`, `# kurage-${name}-end`);
  if (!kurage.transcluder.equals(lines, builder.lines)) {
    $.write(path, kurage.line.join(builder.lines));
    return true;
  }

  return false;
}

async function addRcActionAsync(path, name, code) {
  return await updateRcActionAsync(path, name, async (builder, start, end) => {
    if (0 <= $.findIndex(builder.lines, (line) => line === code)) {
      return;
    }

    builder.lines = $.squeezeBlankLines(
      await $.extrangeAsync(builder.lines, start, end, true)
    );
    builder
      .line('', 0 < builder.lines.length)
      .line(start)
      .line(code)
      .line(end);
  });
}

async function removeRcActionAsync(path, name, code) {
  return await updateRcActionAsync(path, name, async (builder, start, end) => {
    if ($.findIndex(builder.lines, (line) => line === code) < 0) {
      return;
    }

    builder.lines = $.squeezeBlankLines(
      await $.extrangeAsync(builder.lines, start, end, true)
    );
  });
}

async function installAsync() {
  if (!(await kurage.$ok(['which', 'direnv']))) {
    await installActionAsync('direnv', async (installer) => {
      await $.downloadAsync(installerUrls.direnv, installer);
      await kurage.$(['bash', installer]);
      await $.chdirAsync(project, async () => await kurage.$(['direnv', 'allow']));
    });
  }

  if (!$.exists(localMise)) {
    await installActionAsync('mise', async (installer) => {
      await $.downloadAsync(installerUrls.mise, installer);
      await kurage.$(['sh', installer]);
    });
  }

  await kurage.$([localMise, 'install']);

  for (const [shell, path] of Object.entries(rcPaths)) {
    let updated = false;
    if (
      await addRcActionAsync(path, 'mise', `eval "$(${localMise} activate ${shell})"`)
    ) {
      updated = true;
    }
    if (await addRcActionAsync(path, 'direnv', `eval "$(direnv hook ${shell})"`)) {
      updated = true;
    }
    if (updated) {
      kurage.logger.out(kurage.color.paint('cyan', `source ${path}`));
    }
  }
}

async function uninstallAsync() {
  $.remove(await kurage.$out(['which', 'direnv']));
  for (const path of $.glob(`${process.env.HOME}/{.local,.cache}/**/{direnv,mise}`)) {
    $.remove(path);
  }

  for (const [shell, path] of Object.entries(rcPaths)) {
    let updated = false;
    if (
      await removeRcActionAsync(path, 'mise', `eval "$(${localMise} activate ${shell})"`)
    ) {
      updated = true;
    }
    if (await removeRcActionAsync(path, 'direnv', `eval "$(direnv hook ${shell})"`)) {
      updated = true;
    }
    if (updated) {
      kurage.logger.out(kurage.color.paint('cyan', 'exit'));
    }
  }
}

const argument = kurage.argument
  .new('mise')
  .option('-v, --version', 'Show version information', false)
  .command('install', 'Install dev tools')
  .command('uninstall', 'Uninstall dev tools')
  .parse(kurage.process.args);

await (async () => {
  if (argument.options.version) {
    const commands = ['direnv', 'mise', 'node', 'bun', 'pnpm'];
    const versions = {};

    for (const command of commands) {
      versions[command] = (await kurage.$out([command, '--version'])) || null;
    }

    kurage.logger.out(JSON.stringify(versions, null, 2));
    return;
  }

  if (isWindows) {
    let hex = '';
    await $.chdirAsync(
      project,
      async () =>
        (hex = await kurage.$out([
          'powershell',
          '-Command',
          '[System.BitConverter]::ToString([System.Text.Encoding]::UTF8.GetBytes((Get-Location).Path)).Replace("-", "").ToLower()',
        ]))
    );
    await kurage.$([
      kurage.path.join([
        process.env.LOCALAPPDATA,
        'Programs',
        'Microsoft VS Code',
        'Code.exe',
      ]),
      '--folder-uri',
      `vscode-remote://dev-container+${hex}/workspaces/kurage`,
    ]);
    return;
  }

  const mode = argument.args[0] ?? '';
  const action = actions.get(mode);
  if (action == null) {
    argument.abort(`Invalid arg: ${mode}`);
  }

  await action();
})();
