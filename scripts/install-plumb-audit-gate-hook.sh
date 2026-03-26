#!/usr/bin/env bash
set -euo pipefail

# Installs an optional git pre-commit hook that runs `mcp-server`'s plumb audit gate.
#
# Policy controls whether the hook blocks commits:
# - warn-only (default): never blocks, but still writes audit log entries.
# - strict: blocks when gap dimensions report failures.
#
# Environment variables:
# - PLUMB_AUDIT_GATE_POLICY=warn-only|strict
# - PLUMB_AUDIT_GATE_OVERRIDE=1 to force allow in strict mode (audit still records pass/fail)
#
# Notes:
# - This is opt-in and local; teammates without the hook installed are not assumed malicious.

POLICY="${PLUMB_AUDIT_GATE_POLICY:-warn-only}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK_PATH="${REPO_ROOT}/.git/hooks/pre-commit"
GATE_DIST="${REPO_ROOT}/mcp-server/dist/cli/plumb-audit-gate.js"

if [ ! -d "${REPO_ROOT}/.git" ]; then
  echo "plumb audit gate hook: no .git directory found (run inside a git repo)." >&2
  exit 1
fi

mkdir -p "$(dirname "${HOOK_PATH}")"

cat > "${HOOK_PATH}" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

POLICY="${PLUMB_AUDIT_GATE_POLICY:-warn-only}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
GATE_DIST="${REPO_ROOT}/mcp-server/dist/cli/plumb-audit-gate.js"

if [ ! -f "${GATE_DIST}" ]; then
  if [ "${POLICY}" = "strict" ]; then
    npm -C "${REPO_ROOT}/mcp-server" run build
  else
    npm -C "${REPO_ROOT}/mcp-server" run build || true
  fi
fi

if [ ! -f "${GATE_DIST}" ]; then
  # Internal tool/gate failure:
  # - warn-only: allow commits (voluntary gate)
  # - strict: block (user explicitly asked strict)
  if [ "${POLICY}" = "warn-only" ]; then
    exit 0
  fi
  exit 1
fi

set +e
node "${GATE_DIST}" \
  --policy "${POLICY}" \
  --source pre-commit \
  --selection staged
code=$?
set -e

if [ $code -ne 0 ] && [ "${POLICY}" = "warn-only" ]; then
  exit 0
fi

exit $code
EOF

chmod +x "${HOOK_PATH}"
echo "Installed plumb audit gate pre-commit hook at: ${HOOK_PATH}"
echo "Policy: ${POLICY}"

