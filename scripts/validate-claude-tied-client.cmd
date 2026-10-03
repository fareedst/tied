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
set "CLIENT_DIR=%~1"
shift
node "%~dp0run-tied-claude-client-validation.mjs" --client-root "%CLIENT_DIR%" --with-agentstream-dry-run %*
exit /b %ERRORLEVEL%
