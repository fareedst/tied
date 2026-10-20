/**
 * [IMPL-TIED_WORKSPACE_BUILD_ENTRY] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * Styled operator help for build-workspace (texture aligned with tied-install-help.mjs).
 */
import { C_BOLD, C_RESET, writeDim, writeHr, writeSection } from "./console.mjs";

/**
 * @param {string[]} argv
 */
export function isBuildWorkspaceHelpArgv(argv) {
  return argv.length === 1 && (argv[0] === "-h" || argv[0] === "--help");
}

export function printBuildWorkspaceHelp() {
  process.stdout.write(`\n${C_BOLD}TIED workspace build${C_RESET}\n`);
  writeDim("Install and build the TIED store workspace (mcp-server + tools/bootstrap).");
  writeHr();

  writeSection("Examples");
  writeDim("  ./build-workspace.sh");
  writeDim("  ./build-workspace.sh --help");
  writeDim("  ./build-workspace.zsh");
  writeDim("  .\\build-workspace.ps1");
  writeDim("  build-workspace.cmd");
  process.stdout.write("\n");

  writeSection("What it does");
  writeDim("  Step 1/2 — mcp-server: npm install + npm run build");
  writeDim("    Produces: mcp-server/dist/index.js, @tied/cli, @tied/agentstream");
  writeDim("  Step 2/2 — tools/bootstrap: npm install");
  writeDim("    Produces: js-yaml for tied-install verification gates");
  process.stdout.write("\n");

  writeSection("Next steps");
  writeDim("  ./tied-install.sh /path/to/client");
  writeDim("  source scripts/build-commands.sh   # build-mcp, build-workspace aliases");
  process.stdout.write("\n");

  writeSection("Hints");
  writeDim("  • Run the build from the TIED store root (directory containing build-workspace.sh).");
  writeDim("  • Requires Node.js 18+ and npm on PATH for the build (help only needs Node).");
  writeDim("  • Client install help: ./tied-install.sh --help");
  writeDim("  • Windows: .\\build-workspace.ps1 or build-workspace.cmd (same behavior).");
  writeDim("  • Plain output: NO_COLOR=1 ./build-workspace.sh --help");
  writeHr();
  process.stdout.write("\n");
}
