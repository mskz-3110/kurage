#!/usr/bin/env node
import { buffer } from 'node:stream/consumers';
import kurage from '../kurage.js';

async function execJsonAsync() {
  let stdinBytes = Buffer.alloc(0);
  const stdout = kurage.command.stream.new();
  const stderr = kurage.command.stream.new();
  const stdoutBuffer = stdout.buffer();
  const stderrBuffer = stderr.buffer();
  const command = kurage.command.new(kurage.process.args);
  const exec = command.execAsync({ stdio: ['pipe', stdout, stderr] }, {});
  if (!process.stdin.isTTY && command.process?.stdin != null) {
    stdinBytes = await buffer(process.stdin);
    command.process.stdin.write(stdinBytes);
    command.process.stdin.end();
  }
  await exec;
  const [stdoutBytes, stderrBytes] = await Promise.all([stdoutBuffer, stderrBuffer]);
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
          stdout: stdoutBytes.toString().trimEnd(),
          stderr: stderrBytes.toString().trimEnd(),
        },
      },
      null,
      2
    )
  );
}
if (import.meta.main) await execJsonAsync();

export { execJsonAsync };
