import { buffer } from 'node:stream/consumers';
import kurage from '../kurage.js';

export async function execJsonAsync() {
  let result = {};
  const args = kurage.process.args;
  if (0 < args.length) {
    let stdinBytes = Buffer.alloc(0);
    const command = kurage.command.new(args);
    const exec = command.execAsync({ stdio: ['pipe', 'pipe', 'pipe'] }, {});
    if (!process.stdin.isTTY && command.process?.stdin != null) {
      stdinBytes = await buffer(process.stdin);
      command.process.stdin.write(stdinBytes);
      command.process.stdin.end();
    }
    await exec;
    result = {
      command: command.command,
      args: command.args,
      cwd: process.cwd(),
      time: {
        start: command.stopwatch.startTime?.toString(),
        stop: command.stopwatch.stopTime?.toString(),
        duration: command.stopwatch.duration,
      },
      exitCode: command.exitCode,
      exception: command.exception ? command.exception.toString() : '',
      stdio: {
        stdin: stdinBytes.toString(),
        stdout: command.outBuffer.toString().trimEnd(),
        stderr: command.errBuffer.toString().trimEnd(),
      },
    };
  }
  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.main) {
  await execJsonAsync();
}
