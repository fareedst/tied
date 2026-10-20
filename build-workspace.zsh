#!/usr/bin/env zsh
#
# macOS zsh entry point — delegates to build-workspace.sh (bash).
# [IMPL-TIED_WORKSPACE_BUILD_ENTRY] [REQ-TIED_UNIFIED_TOOLCHAIN]
#
exec "${0:A:h}/build-workspace.sh" "$@"
