#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf 'usage: %s [options] [(-0|--null) | (-F|--find) [DIR [GLOB]]] [--] [file ...]\n' "${0##*/}" 1>&2
  printf '  Format each YAML file in place with yq -i -P.\n' 1>&2
  printf '  -F, --find [DIR [GLOB]]  run find internally (default DIR=. GLOB=*.yaml);\n' 1>&2
  printf '     quote GLOB to avoid shell expansion. Mutually exclusive with file args / stdin.\n' 1>&2
  printf '  Unusual find expressions: use find ... -print0 | %s -0 (paths NUL-separated).\n' "${0##*/}" 1>&2
  printf '  With no -F, file args, or (with -) stdin:\n' 1>&2
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
find_mode=false
find_base='.'
find_name='*.yaml'

while [ "$#" -gt 0 ]; do
  case "$1" in
    -0 | --null)
      null_delim=true
      shift
      ;;
    -F | --find)
      find_mode=true
      find_base='.'
      find_name='*.yaml'
      shift
      c=0
      while
        [ "$#" -gt 0 ] && [[ "$1" != -- ]] &&
        [ "${1#-}" = "$1" ]
      do
        if [ "$c" -eq 0 ]; then
          find_base=$1
          c=1
        else
          find_name=$1
          c=2
          shift
          break
        fi
        shift
      done
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

if [ "$find_mode" = true ] && [ "$#" -gt 0 ]; then
  printf '%s: --find cannot be combined with file path arguments; use a pipe, or use --find with optional DIR and GLOB only\n' \
    "${0##*/}" 1>&2
  usage
fi

# Collect paths: --find, CLI args, or stdin (newline- or NUL-separated).
paths=()
if [ "$find_mode" = true ]; then
  while IFS= read -r -d '' line || [ -n "${line:-}" ]; do
    [ -n "$line" ] && paths+=("$line")
  done < <(find "$find_base" -type f -name "$find_name" -print0)
elif [ "$#" -gt 0 ]; then
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
