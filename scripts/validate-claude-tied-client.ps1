# [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]
$ErrorActionPreference = "Stop"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error "ERROR: Node.js is required but was not found on PATH."
  exit 1
}
if ($args.Count -lt 1) {
  Write-Error "usage: validate-claude-tied-client.ps1 CLIENT_DIR [extra flags...]"
  exit 2
}
$clientDir = $args[0]
$extraArgs = @()
if ($args.Count -gt 1) {
  $extraArgs = $args[1..($args.Count - 1)]
}
& node (Join-Path $PSScriptRoot "run-tied-claude-client-validation.mjs") `
  --client-root $clientDir `
  --with-agentstream-dry-run `
  @extraArgs
exit $LASTEXITCODE
