# [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_LAYERED_CLIENT_INSTALL]
$ErrorActionPreference = "Stop"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "ERROR: Node.js is required but was not found on PATH."
  exit 1
}
& node (Join-Path $PSScriptRoot "tools\bootstrap\tied-install-dispatch.mjs") @args
exit $LASTEXITCODE
