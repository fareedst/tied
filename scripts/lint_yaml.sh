#!/usr/bin/env bash
set -euo pipefail

lint_yaml() {
  if [ "$#" -eq 0 ]; then
    printf 'usage: lint_yaml file [file ...]\n' 1>&2
    return 2
  fi

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

lint_yaml "$@"

