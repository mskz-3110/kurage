#!/usr/bin/env bash
set -u

usage() {
  printf '%s\n' \
    'Usage: extrange [options]' \
    'Options:' \
    '  -s, --start <TEXT>  (string)   Start marker                   Required' \
    '  -e, --end <TEXT>    (string)   End marker                     Required' \
    '  -f, --file <PATH>   (string)   Input file                     Required' \
    '  -v, --invert        (boolean)  Print lines outside the range  false' \
    '  -h, --help          (boolean)  Display help                   false'
}

fail() {
  printf '%s\n' "$1" >&2
  exit "$2"
}

parse_args() {
  while (($#)); do
    case "$1" in
      --start|-s) (($# >= 2)) || { usage >&2; fail 'Missing value: -s, --start <TEXT>' 2; }; start=$2; has_start=1; shift 2 ;;
      --end|-e) (($# >= 2)) || { usage >&2; fail 'Missing value: -e, --end <TEXT>' 2; }; end=$2; has_end=1; shift 2 ;;
      --file|-f) (($# >= 2)) || { usage >&2; fail 'Missing value: -f, --file <PATH>' 2; }; file=$2; has_file=1; shift 2 ;;
      --invert|-v) invert=1; shift ;;
      --help|-h) usage >&2; exit 2 ;;
      *) usage >&2; fail "Unknown option: $1" 2 ;;
    esac
  done
  if (( !has_start )); then usage >&2; fail 'Missing required option: -s, --start <TEXT>' 2; fi
  if (( !has_end )); then usage >&2; fail 'Missing required option: -e, --end <TEXT>' 2; fi
  if (( !has_file )); then usage >&2; fail 'Missing required option: -f, --file <PATH>' 2; fi
}

read_lines() {
  [[ -r "$file" && -f "$file" ]] || fail "Cannot read file: $file" 1
  lines=()
  while IFS= read -r line || [[ -n "$line" ]]; do
    lines+=("${line%$'\r'}")
  done < "$file" || fail "Cannot read file: $file" 1
}

print_range() {
  start_idx=-1
  end_idx=-1
  for i in "${!lines[@]}"; do
    if (( start_idx < 0 )) && [[ "${lines[i]}" == "$start" ]]; then start_idx=$i; fi
    if (( start_idx >= 0 && i > start_idx )) && [[ "${lines[i]}" == "$end" ]]; then end_idx=$i; break; fi
  done
  (( start_idx >= 0 && end_idx >= 0 )) || return 0
  for i in "${!lines[@]}"; do
    if (( i != start_idx && i != end_idx && invert != (i > start_idx && i < end_idx) )); then
      printf '%s\n' "${lines[i]}"
    fi
  done
}

start= end= file= invert=0
has_start=0 has_end=0 has_file=0
parse_args "$@"
read_lines
print_range
