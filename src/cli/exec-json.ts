import { buffer } from 'node:stream/consumers';
import kurage from '../kurage.js';

export async function execJsonAsync() {
  let stdinBytes = Buffer.alloc(0);
  const stdout = kurage.command.stream.new({
    maxBufferSize: kurage.command.stream.maxBufferSize,
  });
  const stderr = kurage.command.stream.new({
    maxBufferSize: kurage.command.stream.maxBufferSize,
  });
  const command = kurage.command.new(kurage.process.args);
  const exec = command.execAsync({ stdio: ['pipe', stdout, stderr] }, {});
  if (!process.stdin.isTTY && command.process?.stdin != null) {
    stdinBytes = await buffer(process.stdin);
    command.process.stdin.write(stdinBytes);
    command.process.stdin.end();
  }
  await exec;
  kurage.logger.out(
    JSON.stringify(
      {
        string: command.toString(),
        cwd: process.cwd(),
        time: {
          start: command.stopwatch.startTime?.date.toISOString(),
          stop: command.stopwatch.stopTime?.date.toISOString(),
          duration: command.stopwatch.duration,
        },
        exitCode: command.exitCode,
        exception: command.exception ? command.exception.toString() : '',
        stdio: {
          stdin: stdinBytes.toString(),
          stdout: stdout.buffer.toString().trimEnd(),
          stderr: stderr.buffer.toString().trimEnd(),
        },
      },
      null,
      2
    )
  );
}

if (import.meta.main) {
  await execJsonAsync();
}
