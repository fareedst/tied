#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf 'usage: %s [-0|--null] [--] [file ...]\n' "${0##*/}" 1>&2
  printf '  Format each YAML file in place with yq -i -P.\n' 1>&2
  printf '  With no file arguments, read paths from stdin:\n' 1>&2
  printf '    - One path per line (e.g. find . -name "*.yaml"), when stdin is not a TTY.\n' 1>&2
  printf '    - Or pass - as the only file argument to read paths from stdin on a TTY.\n' 1>&2
  printf '  With -0 or --null, stdin paths are NUL-separated (safe with find -print0).\n' 1>&2
  exit 2
}

lint_yaml_files() {
  local file
  local rc=0

  for file in "$@"; do
    if [ ! -e "$file" ]; then
      printf 'lint_yaml: not found: %s\n' "$file" 1>&2
      rc=1
      continue
    fi
    if [ ! -f "$file" ]; then
      printf 'lint_yaml: not a regular file: %s\n' "$file" 1>&2
      rc=1
      continue
    fi

    # IMPORTANT: do not pass multiple files to one yq invocation.
    # Multi-arg yq pretty-print can merge documents and corrupt files.
    yq -i -P "$file" || rc=$?
  done

  return "$rc"
}

null_delim=false
while [ "$#" -gt 0 ]; do
  case "$1" in
    -0 | --null)
      null_delim=true
      shift
      ;;
    -h | --help)
      usage
      ;;
    --)
      shift
      break
      ;;
    -*)
      printf '%s: unknown option: %s\n' "${0##*/}" "$1" 1>&2
      usage
      ;;
    *)
      break
      ;;
  esac
done

# Collect paths: CLI args, or stdin (newline- or NUL-separated).
paths=()
if [ "$#" -gt 0 ]; then
  if [ "$#" -eq 1 ] && [ "$1" = "-" ]; then
    if "$null_delim"; then
      while IFS= read -r -d '' line || [ -n "${line:-}" ]; do
        [ -n "$line" ] && paths+=("$line")
      done
    else
      while IFS= read -r line || [ -n "${line:-}" ]; do
        [ -z "$line" ] && continue
        paths+=("$line")
      done
    fi
  else
    paths=("$@")
  fi
else
  if [ -t 0 ] && ! "$null_delim"; then
    usage
  fi
  if "$null_delim"; then
    while IFS= read -r -d '' line || [ -n "${line:-}" ]; do
      [ -n "$line" ] && paths+=("$line")
    done
  else
    while IFS= read -r line || [ -n "${line:-}" ]; do
      [ -z "$line" ] && continue
      paths+=("$line")
    done
  fi
fi

if [ "${#paths[@]}" -eq 0 ]; then
  exit 0
fi

lint_yaml_files "${paths[@]}"
