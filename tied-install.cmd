@echo off
setlocal
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is required but was not found on PATH.
  exit /b 1
)
node "%~dp0tools\bootstrap\tied-install-dispatch.mjs" %*
exit /b %ERRORLEVEL%
