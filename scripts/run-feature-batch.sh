#!/usr/bin/env bash
##
# run-feature-batch — delegates to agentstream batch driver (Phase 4b Ruby retirement).
#
# [IMPL-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
# Same CLI surface as before; implementation is scripts/run-feature-batch-agentstream.sh
# (tied agentstream / Go binary). See run-feature-batch-agentstream.sh --help.
##

set -o errexit
set -o nounset
set -o pipefail

_script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${_script_dir}/run-feature-batch-agentstream.sh" "$@"
