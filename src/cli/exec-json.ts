import { buffer } from 'node:stream/consumers';
import kurage from '../kurage.js';

let result = {};
const args = kurage.process.args;
if (0 < args.length) {
  let stdinBytes = Buffer.alloc(0);
  if (!process.stdin.isTTY) {
    stdinBytes = await buffer(process.stdin);
    process.stdin.unshift(stdinBytes);
  }
  const command = await kurage.$command(args, { stdio: ['inherit', 'pipe', 'pipe'] }, {});
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
