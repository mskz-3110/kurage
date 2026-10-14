#!/usr/bin/env node
import { readFileSync } from 'node:fs';

function usage() {
  process.stderr.write(
    [
      'Usage: extrange [options]',
      'Options:',
      '  -s, --start <TEXT>  (string)   Start marker                   Required',
      '  -e, --end <TEXT>    (string)   End marker                     Required',
      '  -f, --file <PATH>   (string)   Input file                     Required',
      '  -v, --invert        (boolean)  Print lines outside the range  false',
      '  -h, --help          (boolean)  Display help                   false',
      '',
    ].join('\n')
  );
}

function fail(message, code) {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function parse_args(args) {
  const options = {
    start: '',
    end: '',
    file: '',
    invert: 0,
    has_start: false,
    has_end: false,
    has_file: false,
  };
  while (args.length > 0) {
    const option = args.shift();
    switch (option) {
      case '--start':
      case '-s':
        if (args.length === 0) {
          usage();
          fail('Missing value: -s, --start <TEXT>', 2);
        }
        options.start = args.shift();
        options.has_start = true;
        break;
      case '--end':
      case '-e':
        if (args.length === 0) {
          usage();
          fail('Missing value: -e, --end <TEXT>', 2);
        }
        options.end = args.shift();
        options.has_end = true;
        break;
      case '--file':
      case '-f':
        if (args.length === 0) {
          usage();
          fail('Missing value: -f, --file <PATH>', 2);
        }
        options.file = args.shift();
        options.has_file = true;
        break;
      case '--invert':
      case '-v':
        options.invert = 1;
        break;
      case '--help':
      case '-h':
        usage();
        process.exit(2);
        break;
      default:
        usage();
        fail(`Unknown option: ${option}`, 2);
    }
  }
  if (!options.has_start) {
    usage();
    fail('Missing required option: -s, --start <TEXT>', 2);
  }
  if (!options.has_end) {
    usage();
    fail('Missing required option: -e, --end <TEXT>', 2);
  }
  if (!options.has_file) {
    usage();
    fail('Missing required option: -f, --file <PATH>', 2);
  }
  return options;
}

function read_lines(file) {
  try {
    const lines = readFileSync(file, 'utf8').split('\n');
    const normalized_lines = [];
    for (let i = 0; i < lines.length; i += 1) {
      if (i === lines.length - 1 && lines[i] === '') continue;
      normalized_lines.push(lines[i].replace(/\r$/, ''));
    }
    return normalized_lines;
  } catch {
    fail(`Cannot read file: ${file}`, 1);
  }
}

function print_range(lines, start, end, invert) {
  const start_index = lines.indexOf(start);
  if (start_index < 0) return;
  const end_index = lines.findIndex((line, index) => index > start_index && line === end);
  if (end_index < 0) return;

  const selected_lines = invert
    ? lines.slice(0, start_index).concat(lines.slice(end_index + 1))
    : lines.slice(start_index + 1, end_index);
  for (const line of selected_lines) {
    process.stdout.write(`${line}\n`);
  }
}

const options = parse_args(process.argv.slice(2));
print_range(read_lines(options.file), options.start, options.end, options.invert);
