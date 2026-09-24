@echo off
setlocal
where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is required but was not found on PATH.
  exit /b 1
)
if "%~1"=="" (
  echo usage: validate-claude-tied-client.cmd CLIENT_DIR
  exit /b 2
)
node "%~dp0run-tied-claude-client-validation.mjs" --client-root "%~1" --with-agentstream-dry-run %*
exit /b %ERRORLEVEL%
