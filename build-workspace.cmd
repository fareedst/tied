@echo off
setlocal
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is required but was not found on PATH.
  exit /b 1
)
where powershell >nul 2>&1
if errorlevel 1 (
  echo ERROR: PowerShell is required for build-workspace.cmd.
  echo Run manually from repo root:
  echo   cd mcp-server ^&^& npm install ^&^& npm run build
  echo   cd ..\tools\bootstrap ^&^& npm install
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-workspace.ps1" %*
exit /b %ERRORLEVEL%
