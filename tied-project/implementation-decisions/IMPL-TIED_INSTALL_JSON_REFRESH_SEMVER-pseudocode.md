# [IMPL-TIED_INSTALL_JSON_REFRESH_SEMVER] [ARCH-TIED_INSTALL_JSON_REFRESH_SEMVER] [REQ-TIED_INSTALL_JSON_REFRESH_SEMVER]

```
// [IMPL-TIED_INSTALL_JSON_REFRESH_SEMVER] — store pin on manifest; MCP install.json before VERSION walk
PROCEDURE READ_STORE_METHODOLOGY_SEMVER(storeRoot)
  TRY storeRoot/VERSION semver
  TRY storeRoot/AGENTS.md TIED Methodology Version line
  RETURN "unknown"

PROCEDURE RESOLVE_METHODOLOGY_SEMVER_FOR_CLIENT(anchorRoots)
  FOR each root: TRY tied-bundle/install.json pin
  FOR each anchor: TRY ancestor VERSION
  FOR each root: TRY AGENTS.md line
  FAIL if none
```
