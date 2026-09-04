@echo off
setlocal
call "%~dp0copy_files.cmd" %*
if errorlevel 1 exit /b %ERRORLEVEL%
echo.
echo --- Next steps ---
echo You have tied/ and (when copy_files succeeded) .cursor/skills/tied-yaml with tied-cli.sh.
echo   - Agents / automation (Node required): .cursor/skills/tied-yaml/scripts/tied-cli.sh
echo     with TIED_BASE_PATH to this project's tied/ and TIED_MCP_BIN to a built mcp-server/dist/index.js (see SKILL.md).
echo     TIED_MCP_BIN alone is not enough—you need the tied-cli.sh script from the skill bundle and Node on PATH.
echo   - Cursor in-editor MCP: add tied-yaml to .cursor/mcp.json per docs/adding-tied-mcp-and-invoking-passes.md
echo     (copy_files does not write mcp.json when one already exists).
echo   - Manual YAML only when you are not using tied-cli: edit project indexes and detail YAML under tied/
echo     per tied/docs/using-tied-without-mcp.md — not ad-hoc parser scripts.
echo   - Use semantic tokens in code and tests; keep tied/semantic-tokens.yaml in sync.
exit /b 0
