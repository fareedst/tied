# Windows smoke runbook — REQ-TIED_SETUP windows bootstrap

Run on **192.168.6.4** (`ssh fareed.stevenson@win`) after syncing this repo.

## 1. Sync repo on Windows

Adjust `STDD_WIN` if your clone path differs:

```cmd
set STDD_WIN=C:\Users\fareed.stevenson\Documents\dev\chatgpt\stdd
cd /d %STDD_WIN%
git status
git pull
```

If the repo only exists on macOS, clone or copy the working tree first.

## 2. Build MCP server (once per sync)

```cmd
cd /d %STDD_WIN%\mcp-server
npm install
npm run build
cd /d %STDD_WIN%
```

## 3. Automated smoke

```cmd
cd /d %STDD_WIN%
scripts\windows-bootstrap-smoke.cmd
```

Expected: `=== Windows bootstrap smoke PASSED ===`

## 4. Disposable client pipeline (optional)

```cmd
cd /d %STDD_WIN%
scripts\test-new-tied-client --skip-mcp-enable --skip-git
```

Creates `%USERPROFILE%\Documents\dev\test\<unix-seconds>` with bootstrap + lint.

## 5. Neighboring-repo PATHEXT check (optional)

```cmd
mkdir %TEMP%\tied-pathex-smoke
cd /d %TEMP%\tied-pathex-smoke
call %STDD_WIN%\copy_files.cmd
dir tied\requirements.yaml
```

## Record evidence

After success, note date/host in PR test plan or tracker `execution_evidence`.
