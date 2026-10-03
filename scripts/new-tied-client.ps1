# [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
$ErrorActionPreference = "Stop"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "ERROR: Node.js is required but was not found on PATH."
  exit 1
}
& node (Join-Path $PSScriptRoot "..\tools\bootstrap\new-tied-client.mjs") @args
exit $LASTEXITCODE
