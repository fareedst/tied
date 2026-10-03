@echo off
setlocal EnableDelayedExpansion
REM [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] Windows bootstrap smoke — run from TIED repo root.
REM Usage: scripts\windows-bootstrap-smoke.cmd [optional-client-dir]

set "REPO_ROOT=%~dp0.."
pushd "%REPO_ROOT%" || exit /b 1

echo === Windows bootstrap smoke [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] ===
echo REPO_ROOT=%CD%

where node >nul 2>&1
if errorlevel 1 (
  echo FAIL: Node.js 18+ required on PATH
  exit /b 1
)
for /f "delims=" %%v in ('node --version') do echo Node: %%v

if not exist "tied-install.cmd" (
  echo FAIL: tied-install.cmd missing at repo root
  exit /b 1
)
if not exist "mcp-server\dist\index.js" (
  echo WARN: mcp-server not built — run: cd mcp-server ^&^& npm install ^&^& npm run build
  exit /b 1
)

if "%~1"=="" (
  set "SMOKE_DIR=%TEMP%\tied-bootstrap-smoke-%RANDOM%"
) else (
  set "SMOKE_DIR=%~1"
)
echo SMOKE_DIR=!SMOKE_DIR!

if not exist "!SMOKE_DIR!" mkdir "!SMOKE_DIR!"

echo.
echo --- 1/4 tied-install.cmd linked ---
cd /d "!SMOKE_DIR!"
call "%REPO_ROOT%\tied-install.cmd" --mode linked
if errorlevel 1 (
  echo FAIL: tied-install.cmd linked
  popd
  exit /b 1
)
if not exist "tied-project\requirements.yaml" (
  if not exist "tied\requirements.yaml" (
    echo FAIL: project requirements.yaml not created
    popd
    exit /b 1
  )
)
if not exist ".cursor\mcp.json" (
  echo FAIL: .cursor\mcp.json not initialized
  popd
  exit /b 1
)
if not exist "tied-bundle\install.json" (
  echo FAIL: tied-bundle\install.json missing after linked install
  popd
  exit /b 1
)
echo OK: linked bootstrap layout

echo.
echo --- 1b Claude dual-bootstrap asserts [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] ---
node "%REPO_ROOT%\tools\bootstrap\assert-windows-bootstrap-claude.mjs" "!SMOKE_DIR!"
if errorlevel 1 (
  echo FAIL: Claude Windows bootstrap asserts
  popd
  exit /b 1
)
echo OK: Claude skills + repo-root .mcp.json

echo.
echo --- 2/4 lint_yaml.cmd -F tied ---
call "%REPO_ROOT%\scripts\lint_yaml.cmd" -F tied
if errorlevel 1 (
  echo FAIL: lint_yaml.cmd
  popd
  exit /b 1
)
echo OK: YAML lint

echo.
echo --- 3/4 install-layers.mjs direct entrypoint ---
set "NODE_SMOKE=%TEMP%\tied-node-smoke-%RANDOM%"
mkdir "!NODE_SMOKE!" 2>nul
node "%REPO_ROOT%\tools\bootstrap\install-layers.mjs" --mode linked "!NODE_SMOKE!"
if errorlevel 1 (
  echo FAIL: install-layers.mjs direct invoke
  popd
  exit /b 1
)
if not exist "!NODE_SMOKE!\tied-project\requirements.yaml" (
  if not exist "!NODE_SMOKE!\tied\requirements.yaml" (
    echo FAIL: Node entrypoint did not create requirements.yaml
    popd
    exit /b 1
  )
)
echo OK: Node CLI entrypoint

echo.
echo --- 3b Claude asserts on Node entrypoint client ---
node "%REPO_ROOT%\tools\bootstrap\assert-windows-bootstrap-claude.mjs" "!NODE_SMOKE!"
if errorlevel 1 (
  echo FAIL: Claude asserts on Node smoke client
  popd
  exit /b 1
)
echo OK: Claude asserts on Node smoke client

echo.
echo --- 4/4 migrate-layout dry-run on legacy fixture ---
set "LEGACY_FIX=%TEMP%\tied-legacy-fix-%RANDOM%"
mkdir "!LEGACY_FIX!\tied" 2>nul
echo requirements: []> "!LEGACY_FIX!\tied\requirements.yaml"
node "%REPO_ROOT%\tools\bootstrap\install-layers.mjs" --migrate-layout --dry-run "!LEGACY_FIX!"
if errorlevel 1 (
  echo FAIL: migrate-layout dry-run
  popd
  exit /b 1
)
echo OK: migrate-layout dry-run

echo.
echo --- 5/5 test-new-tied-client.cmd factory skips ---
set "TIED_TEST_ROOT=%TEMP%\tied-factory-smoke"
if not exist "!TIED_TEST_ROOT!" mkdir "!TIED_TEST_ROOT!"
call "%REPO_ROOT%\test-new-tied-client.cmd" --skip-mcp-enable --skip-git --skip-onboarding-audit
if errorlevel 1 (
  echo FAIL: test-new-tied-client.cmd
  popd
  exit /b 1
)
echo OK: disposable factory smoke

popd
echo.
echo === Windows bootstrap smoke PASSED ===
echo Client dir: !SMOKE_DIR!
exit /b 0
