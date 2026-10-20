/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * Styled operator help for tied-install (texture aligned with build-workspace.sh).
 */
import { C_BOLD, C_RESET, writeDim, writeHr, writeSection } from "./console.mjs";

/**
 * @param {string[]} argv
 */
export function isTiedInstallHelpArgv(argv) {
  return (
    argv.length === 0 ||
    (argv.length === 1 && (argv[0] === "-h" || argv[0] === "--help"))
  );
}

export function printTiedInstallHelp() {
  process.stdout.write(`\n${C_BOLD}TIED client install${C_RESET}\n`);
  writeDim("Install TIED layers into a client directory (default mode: linked).");
  writeHr();

  writeSection("Prerequisite — built store workspace");
  writeDim("  From the TIED store root, run: ./build-workspace.sh");
  writeDim("  Produces mcp-server/dist/index.js and bootstrap deps for verify gates.");
  process.stdout.write("\n");

  writeSection("Examples");
  writeDim("  ./tied-install.sh /path/to/client");
  writeDim("  ./tied-install.sh .                    # install into current directory");
  writeDim("  ./tied-install.sh --mode linked --store /abs/tied-store /path/to/primary");
  writeDim("  ./tied-install.sh --migrate-layout /path/to/brownfield");
  writeDim("  ./tied-install.sh --refresh /path/to/client");
  process.stdout.write("\n");

  writeSection("Options");
  writeDim("  --layers db,mcp,skills,methodology   Capability layers (default: all)");
  writeDim("  --harness cursor|claude|both         Default: both");
  writeDim("  --mode linked|full                   Default: linked");
  writeDim("  --store PATH                         TIED store root");
  writeDim("  --methodology-bundle live|pinned     Default: live");
  writeDim("  --refresh                            Re-run from tied-bundle/install.json");
  writeDim("  --allow-self-install                 Allow install when project root equals store root");
  writeDim("  --doctor                             No-MCP self-test on installed client");
  writeDim("  --migrate-layout                     Brownfield layout migration (idempotent)");
  writeDim("  --store                              With --migrate-layout --dry-run: store git mv plan");
  writeDim("  --dry-run                            With --migrate-layout: plan only");
  writeDim("  --merge-vocab                        Accepted for parity (full methodology only)");
  writeDim("  --methodology-readonly               Unix chmod for full methodology tree");
  writeDim("  --install-methodology-hook           Install client pre-commit hook template");
  writeDim("  Plus parity flags: --skip-parity-gate, --strict-refresh, etc.");
  writeDim("  Plus tool flags: --full-tools, --with-jev, --with-dae, --with-bbce");
  process.stdout.write("\n");

  writeSection("Hints");
  writeDim("  • Missing MCP build: run ./build-workspace.sh from the TIED store root first.");
  writeDim("  • Legacy tied/ layout: use --migrate-layout before a normal install.");
  writeDim("  • Store root equals client root: use --allow-self-install or a separate store clone.");
  writeDim("  • Windows: .\\tied-install.ps1 or tied-install.cmd (same behavior).");
  writeDim("  • No arguments prints this help; pass . to install the current directory.");
  writeHr();
  process.stdout.write("\n");
}
