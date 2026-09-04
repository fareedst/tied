@echo off
setlocal EnableDelayedExpansion
REM [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP] Windows bootstrap smoke — run from TIED repo root.
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

if not exist "tools\bootstrap\copy-files.mjs" (
  echo FAIL: tools\bootstrap\copy-files.mjs missing
  exit /b 1
)
if not exist "copy_files.cmd" (
  echo FAIL: copy_files.cmd missing at repo root
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
echo --- 1/3 copy_files.cmd ---
cd /d "!SMOKE_DIR!"
call "%REPO_ROOT%\copy_files.cmd"
if errorlevel 1 (
  echo FAIL: copy_files.cmd
  popd
  exit /b 1
)
if not exist "tied\requirements.yaml" (
  echo FAIL: tied\requirements.yaml not created
  popd
  exit /b 1
)
if not exist ".cursor\mcp.json" (
  echo FAIL: .cursor\mcp.json not initialized
  popd
  exit /b 1
)
echo OK: bootstrap layout

echo.
echo --- 2/3 lint_yaml.cmd -F tied ---
call "%REPO_ROOT%\scripts\lint_yaml.cmd" -F tied
if errorlevel 1 (
  echo FAIL: lint_yaml.cmd
  popd
  exit /b 1
)
echo OK: YAML lint

echo.
echo --- 3/3 Node direct entrypoint ---
set "NODE_SMOKE=%TEMP%\tied-node-smoke-%RANDOM%"
mkdir "!NODE_SMOKE!" 2>nul
node "%REPO_ROOT%\tools\bootstrap\copy-files.mjs" "!NODE_SMOKE!"
if errorlevel 1 (
  echo FAIL: copy-files.mjs direct invoke
  popd
  exit /b 1
)
if not exist "!NODE_SMOKE!\tied\requirements.yaml" (
  echo FAIL: Node entrypoint did not create tied\requirements.yaml
  popd
  exit /b 1
)
echo OK: Node CLI entrypoint

popd
echo.
echo === Windows bootstrap smoke PASSED ===
echo Client dir: !SMOKE_DIR!
exit /b 0
