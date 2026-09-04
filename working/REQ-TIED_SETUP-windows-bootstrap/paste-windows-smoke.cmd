@echo off
REM Paste into Windows SSH session after syncing stdd repo.
REM Prerequisite: Node 18+, repo at STDD_WIN, mcp-server built.

set "STDD_WIN=C:\Users\fareed.stevenson\Documents\dev\chatgpt\stdd"
cd /d %STDD_WIN% || (echo Adjust STDD_WIN path && exit /b 1)
cd mcp-server && call npm run build && cd ..
call scripts\windows-bootstrap-smoke.cmd
echo exit=%ERRORLEVEL%
