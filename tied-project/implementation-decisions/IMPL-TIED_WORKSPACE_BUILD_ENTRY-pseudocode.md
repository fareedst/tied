# IMPL-TIED_WORKSPACE_BUILD_ENTRY — essence pseudocode

```text
// [IMPL-TIED_WORKSPACE_BUILD_ENTRY] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
// How: Styled operator help for build-workspace without npm side effects.
PROCEDURE BUILD_WORKSPACE_HELP_TEXTURE(argv)
  PRE: argv is shell or ps1 argument list
  POST: if sole -h or --help then printBuildWorkspaceHelp on stdout and exit 0; elif argv non-empty then error with pointer to --help; else run workspace build
  EFFECTS: help guard runs before store-root and npm preconditions; Node only required for help path
  FAILURE_MODES: NODE_MISSING_ON_HELP exits 1 with stderr message

  IF argv is exactly one of (-h, --help) THEN
    INVOKE node tools/bootstrap/build-workspace-help-cli.mjs
    TERMINATE exit 0
  ENDIF
  IF argv length > 0 THEN
    TERMINATE exit 1 with unexpected argument message
  ENDIF
  CONTINUE existing mcp-server and bootstrap npm steps
END PROCEDURE
```
