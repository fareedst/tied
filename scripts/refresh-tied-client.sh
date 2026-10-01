#!/usr/bin/env bash
#
# [REQ-TIED_SETUP] [PROC-TIED_METHODOLOGY_READONLY]
# Refresh inherited TIED methodology in an existing client from this repository.
# See tied/docs/methodology-migration.md and working/client-refresh/README.md.
#
# Usage:
#   export TIED_SOURCE="/path/to/stdd"   # optional; defaults to repo containing this script
#   ./scripts/refresh-tied-client.sh /path/to/client
#   ./scripts/refresh-tied-client.sh --apply-vocab /path/to/client
#   ./scripts/refresh-tied-client.sh --sync-docs /path/to/client   # Parity B: copy drifted DOCS_TO_COPY from source
#
# Flags (pass before CLIENT path):
#   --apply-vocab     Run migrate_vocab_ownership.rb --apply after report-only review
#   --sync-docs       Overwrite client tied/docs/* that differ from source (strict Parity B helper)
#   --skip-build      Skip mcp-server npm run build
#   --tag             Create annotated rollback tag on client (default: on)
#   --no-tag          Skip rollback tag
#
# Bootstrap uses tools/bootstrap/copy-files.mjs (not copy_files.sh) so parity and hook flags
# are supported. Methodology/hook flags MUST precede parity flags (--strict-refresh, etc.).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIED_SOURCE="${TIED_SOURCE:-$(cd "${SCRIPT_DIR}/.." && pwd)}"
COPY_FILES_MJS="${TIED_SOURCE}/tools/bootstrap/copy-files.mjs"
MIGRATE_VOCAB="${TIED_SOURCE}/scripts/migrate_vocab_ownership.rb"
VERIFY_MJS="${TIED_SOURCE}/tools/bootstrap/verify-client-methodology.mjs"

APPLY_VOCAB=false
SYNC_DOCS=false
SKIP_BUILD=false
DO_TAG=true

ARGS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply-vocab) APPLY_VOCAB=true; shift ;;
    --sync-docs) SYNC_DOCS=true; shift ;;
    --skip-build) SKIP_BUILD=true; shift ;;
    --tag) DO_TAG=true; shift ;;
    --no-tag) DO_TAG=false; shift ;;
    -*) echo "ERROR: Unknown flag: $1" >&2; exit 1 ;;
    *) ARGS+=("$1"); shift ;;
  esac
done

CLIENT="${ARGS[0]:-}"
if [[ -z "${CLIENT}" || ! -d "${CLIENT}" ]]; then
  echo "ERROR: Client project root required." >&2
  exit 1
fi
CLIENT="$(cd "${CLIENT}" && pwd)"

if [[ ! -f "${COPY_FILES_MJS}" ]]; then
  echo "ERROR: Missing ${COPY_FILES_MJS}" >&2
  exit 1
fi

if [[ "${DO_TAG}" == true ]]; then
  TAG="pre-tied-methodology-refresh-$(date +%Y%m%d%H%M%S)"
  git -C "${CLIENT}" tag -a "${TAG}" -m "Rollback before TIED methodology refresh (stdd $(git -C "${TIED_SOURCE}" rev-parse --short HEAD))"
  echo "DEBUG: Created client rollback tag ${TAG}"
fi

if [[ "${SKIP_BUILD}" != true ]]; then
  echo "DEBUG: Building mcp-server in ${TIED_SOURCE}/mcp-server"
  (cd "${TIED_SOURCE}/mcp-server" && npm run build)
fi

mkdir -p "${CLIENT}/.tied"
echo "DEBUG: Pre-refresh parity baseline"
node "${VERIFY_MJS}" --strict-refresh \
  --parity-report="${CLIENT}/.tied/client-refresh-parity-report.pre.json" \
  "${CLIENT}" || true

if [[ -f "${MIGRATE_VOCAB}" ]]; then
  echo "DEBUG: Vocabulary ownership report"
  ruby "${MIGRATE_VOCAB}" --fail-on-review "${CLIENT}" || true
  if [[ "${APPLY_VOCAB}" == true ]]; then
    ruby "${MIGRATE_VOCAB}" --apply "${CLIENT}" || true
  fi
fi

if [[ "${SYNC_DOCS}" == true ]]; then
  echo "DEBUG: Syncing drifted DOCS_TO_COPY from source (Parity B helper)"
  node -e "
const fs=require('fs');
const path=require('path');
const manifest=JSON.parse(fs.readFileSync('${TIED_SOURCE}/tools/bootstrap/manifest.json','utf8'));
const docs=manifest.DOCS_TO_COPY||[];
const srcRoot=path.join('${TIED_SOURCE}','tied','docs');
const destRoot=path.join('${CLIENT}','tied','docs');
for (const name of docs) {
  const src=path.join(srcRoot,name);
  const dest=path.join(destRoot,name);
  if (!fs.existsSync(src)||!fs.existsSync(dest)) continue;
  const a=fs.readFileSync(src);
  const b=fs.readFileSync(dest);
  if (!a.equals(b)) { fs.copyFileSync(src,dest); console.log('synced',name); }
}
"
fi

echo "DEBUG: Bootstrap refresh (strict parity, hooks, merge-vocab)"
node "${COPY_FILES_MJS}" \
  --merge-vocab \
  --methodology-readonly \
  --install-methodology-hook \
  --strict-refresh \
  "${CLIENT}"

if ! git -C "${CLIENT}" config --get core.hooksPath >/dev/null 2>&1; then
  git -C "${CLIENT}" config core.hooksPath .githooks
  echo "DEBUG: Set core.hooksPath=.githooks on client"
fi

echo "DEBUG: Post-refresh parity"
node "${VERIFY_MJS}" --strict-refresh "${CLIENT}"

TIED_BASE_PATH="${CLIENT}/tied" \
  "${CLIENT}/.cursor/skills/tied-yaml/scripts/tied-cli.sh" tied_config_get_base_path

TIED_BASE_PATH="${CLIENT}/tied" \
  "${CLIENT}/.cursor/skills/tied-yaml/scripts/tied-cli.sh" tied_validate_consistency >/dev/null

echo "OK: Methodology refresh complete for ${CLIENT}"
