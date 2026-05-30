#!/usr/bin/env bash
set -euo pipefail

tool_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

for arg in "$@"; do
  case "$arg" in
    --sort-lists)
      printf 'lint_yaml.sh: list sort is yaml_tool.sh --sort-lists\n' 1>&2
      exit 2
      ;;
  esac
done

exec "$tool_dir/yaml_tool.sh" "$@"
