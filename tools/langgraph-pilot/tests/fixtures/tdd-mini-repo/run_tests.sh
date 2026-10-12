#!/usr/bin/env bash
set -euo pipefail
if [[ -f .green ]]; then
  exit 0
fi
echo "AssertionError: expected .green marker" >&2
exit 1
