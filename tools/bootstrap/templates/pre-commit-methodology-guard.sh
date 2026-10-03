#!/usr/bin/env bash
# [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY] Reject staged paths under tied-bundle/ (read-only inherited tree).
set -euo pipefail

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "pre-commit-methodology-guard: not a git repository" >&2
  exit 1
fi

blocked=0
while IFS= read -r path; do
  [[ -z "$path" ]] && continue
  norm="${path//\\//}"
  norm="${norm#./}"
  case "$norm" in
    tied/methodology|tied-bundle/*)
      echo "ERROR: cannot commit changes under tied-bundle/ (read-only methodology snapshot): $path" >&2
      blocked=1
      ;;
  esac
done < <(git diff --cached --name-only --diff-filter=ACM)

if [[ "$blocked" -ne 0 ]]; then
  echo "Hint: edit project YAML under tied/ (not tied-bundle/); refresh methodology via tied-install.sh from the TIED source repo." >&2
  exit 1
fi

exit 0
