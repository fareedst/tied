# build-workspace.ps1 — install and build the TIED store workspace (mcp-server + bootstrap).
#
# From repo root (PowerShell):
#   .\build-workspace.ps1
#
# [IMPL-TIED_WORKSPACE_BUILD_ENTRY] [REQ-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_STORE_README_CERTIFIABLE_ONBOARDING]

$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$McpDir = Join-Path $Root "mcp-server"
$BootstrapDir = Join-Path $Root "tools\bootstrap"

function Write-Step($Text) { Write-Host "▶ $Text" -ForegroundColor Cyan }
function Write-Ok($Text) { Write-Host "  ✓ $Text" -ForegroundColor Green }
function Write-Warn($Text) { Write-Host "WARN: $Text" -ForegroundColor Yellow }
function Write-Hr { Write-Host ("─" * 56) -ForegroundColor DarkGray }

function Fail {
  param([string]$Message, [string[]]$Hints)
  Write-Host ""
  Write-Host "ERROR: $Message" -ForegroundColor Red
  if ($Hints.Count -gt 0) {
    Write-Host "Hints:" -ForegroundColor White
    foreach ($h in $Hints) { Write-Host "  • $h" }
  }
  Write-Hr
  exit 1
}

function Invoke-NpmInDir {
  param([string]$Dir, [string[]]$NpmArgs)
  Push-Location $Dir
  try {
    & npm @NpmArgs
    if ($LASTEXITCODE -ne 0) {
      throw "npm $($NpmArgs -join ' ') exited with $LASTEXITCODE"
    }
  }
  finally { Pop-Location }
}

# --- Help / argv (before store preconditions) ---
if ($args.Count -eq 1 -and ($args[0] -eq "-h" -or $args[0] -eq "--help")) {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is required but was not found on PATH." -ForegroundColor Red
    exit 1
  }
  $HelpCli = Join-Path $Root "tools\bootstrap\build-workspace-help-cli.mjs"
  & node $HelpCli
  exit $LASTEXITCODE
}
if ($args.Count -gt 0) {
  Fail "Unexpected argument(s): $($args -join ' ')" @(
    "Run .\build-workspace.ps1 --help for usage."
  )
}

if (-not (Test-Path (Join-Path $McpDir "package.json"))) {
  Fail "Not a TIED store root (missing mcp-server\package.json)." @(
    "Run from the repository root that contains build-workspace.ps1."
  )
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Fail "Node.js is not on PATH." @(
    "Install Node.js 18+ from https://nodejs.org/"
    "Verify: node -v; npm -v"
  )
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Fail "npm is not on PATH." @(
    "Reinstall Node.js or add npm to PATH."
  )
}

Write-Host ""
Write-Host "TIED workspace build" -ForegroundColor White
Write-Host "Repo: $Root" -ForegroundColor DarkGray
Write-Hr

Write-Step "Step 1/2 — mcp-server (npm install + npm run build)"
Write-Host "  Produces: mcp-server\dist\index.js, @tied/cli, @tied/agentstream" -ForegroundColor DarkGray

try {
  Invoke-NpmInDir $McpDir install
} catch {
  Fail "npm install failed in mcp-server\." @(
    "Check Node 18+: node -v"
    "Retry after: Remove-Item -Recurse -Force mcp-server\node_modules -ErrorAction SilentlyContinue"
    "Do not run npm as Administrator in the project tree."
  )
}
Write-Ok "mcp-server dependencies installed"

try {
  Invoke-NpmInDir $McpDir run build
} catch {
  Fail "npm run build failed in mcp-server\." @(
    "Read compiler output above."
    "cd mcp-server; npm run build"
  )
}
Write-Ok "mcp-server build complete"

$Dist = Join-Path $McpDir "dist\index.js"
if (-not (Test-Path $Dist)) {
  Write-Warn "Build finished but mcp-server\dist\index.js is missing — tied-install and MCP may fail."
}

Write-Step "Step 2/2 — tools\bootstrap (npm install)"
Write-Host "  Produces: js-yaml for tied-install verification gates" -ForegroundColor DarkGray

if (-not (Test-Path $BootstrapDir)) {
  Fail "Missing tools\bootstrap\." @("Use a full TIED store checkout.")
}

try {
  Invoke-NpmInDir $BootstrapDir install
} catch {
  Fail "npm install failed in tools\bootstrap\." @(
    "Same as mcp-server: Node 18+, network, remove tools\bootstrap\node_modules and retry."
  )
}
Write-Ok "bootstrap dependencies installed"

Write-Hr
Write-Host "Workspace build finished." -ForegroundColor Green
Write-Host "Next: .\tied-install.cmd C:\path\to\client" -ForegroundColor DarkGray
Write-Host ""
