@echo off
setlocal
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is required but was not found on PATH.
  echo Install Node.js 18+ from https://nodejs.org/ and re-run copy_files.
  exit /b 1
)
node "%~dp0tools\bootstrap\copy-files.mjs" %*
exit /b %ERRORLEVEL%
