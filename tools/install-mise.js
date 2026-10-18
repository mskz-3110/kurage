#!/usr/bin/env node
const { kurage } = await import('kurage');
const { updateShellConfig } = await import('./shell-config.js');

export async function installMise() {
  const $ = kurage.spellbook;
  const home = process.env.HOME ?? process.env.USERPROFILE;
  const isWindows = process.platform === 'win32';
  const localAppData =
    process.env.LOCALAPPDATA ??
    kurage.path.join([process.env.USERPROFILE ?? '', 'AppData', 'Local']);
  const windowsLinksPath = kurage.path.join([
    localAppData,
    'Microsoft',
    'WinGet',
    'Links',
  ]);
  const windowsPackagesPath = kurage.path.join([
    localAppData,
    'Microsoft',
    'WinGet',
    'Packages',
  ]);
  const windowsMisePath = kurage.path.join([windowsLinksPath, 'mise.exe']);
  const findWindowsMise = () => {
    if ($.exists(windowsMisePath)) return windowsMisePath;
    if ($.exists(windowsPackagesPath)) {
      const [misePath] = $.glob('**/mise.exe', { cwd: windowsPackagesPath });
      if (misePath) return kurage.path.join([windowsPackagesPath, misePath]);
    }
    return 'mise';
  };
  let mise = isWindows ? findWindowsMise() : 'mise';
  let updatedPaths = [];
  const updateWindowsPath = () => {
    if (mise === 'mise') return;

    const miseDirectory = $.dirname(mise);
    const miseRelativePath = $.relative(
      miseDirectory,
      kurage.path.join([localAppData, 'Microsoft', 'WinGet', 'Packages'])
    ).replaceAll('\\', '/');
    updatedPaths = updateShellConfig(
      `if command -v cygpath >/dev/null 2>&1; then export PATH="$(cygpath -u "\${LOCALAPPDATA}")/Microsoft/WinGet/Packages/${miseRelativePath}:\${PATH}"; fi`
    );
  };

  if (!(await kurage.$ok([mise, '--version']))) {
    if (isWindows) {
      if (!(await kurage.$ok(['winget', '--version']))) {
        kurage.process.abort('winget is required.');
      }
      const wingetInstall = await kurage.$command([
        'winget',
        'install',
        '--id',
        'jdx.mise',
        '--exact',
        '--accept-source-agreements',
        '--accept-package-agreements',
      ]);
      if (wingetInstall.exitCode !== 0 && wingetInstall.exitCode !== 2316632107) {
        wingetInstall.exitIfFailure();
      }
      process.env.PATH = `${windowsLinksPath};${process.env.PATH ?? ''}`;
      mise = findWindowsMise();
      if (!(await kurage.$ok([mise, '--version']))) {
        kurage.logger.err(
          `mise.exe was not found under ${windowsPackagesPath} or ${windowsLinksPath}.`
        );
        for (const rcPath of updatedPaths) {
          kurage.logger.out(`Run: ${kurage.color.paint('cyan', `source ${rcPath}`)}`);
        }
        return;
      }
    } else {
      const installer = `/tmp/kurage-mise-install-${$.uuid()}.sh`;
      try {
        await $.downloadAsync('https://mise.run', installer);
        await kurage.$(['sh', installer]);
      } finally {
        $.remove(installer);
      }

      updatedPaths = updateShellConfig('eval "$(~/.local/bin/mise activate {shell})"');
      mise = `${home}/.local/bin/mise`;
    }
  }

  if (isWindows) updateWindowsPath();

  if (await kurage.$ok(['which', 'mise'])) {
    await kurage.$([mise, 'install']);
    kurage.logger.out(await kurage.$out(['mise', '-v']));
  }

  for (const rcPath of updatedPaths) {
    kurage.logger.out(`Run: ${kurage.color.paint('cyan', `source ${rcPath}`)}`);
  }
}

if (kurage.isMain(import.meta.main, 'tools/install-mise.js')) {
  await installMise();
}
