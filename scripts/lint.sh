#!/usr/bin/env bash
set -euo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo_root=$(cd "${script_dir}/.." && pwd)

cd "${repo_root}"

echo_exec "${script_dir}/lint_yaml.sh" -F tied
echo_exec "${script_dir}/yaml_tool.sh" --quiet --sort-lists --sort-keys -F tied

if ! verify_output="$(
  TIED_MCP_BIN="${repo_root}/mcp-server/dist/index.js" \
    echo_exec "${repo_root}/tools/bundled-tied-yaml-skill/scripts/tied-cli.sh" tied_verify '{}' 2>&1
)"; then
  printf '%s\n' "${verify_output}"
  exit 1
fi

if [[ "${verify_output}" == *'"ok": false'* ]]; then
  printf '%s\n' "${verify_output}"
  exit 1
fi
