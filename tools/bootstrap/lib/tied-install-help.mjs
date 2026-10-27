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
  writeDim("  ./tied-install.sh --migrate-ordered-list-keys /path/to/client");
  writeDim("  ./tied-install.sh --migrate-ordered-list-keys --dry-run .");
  writeDim("  ./tied-install.sh --refresh /path/to/client");
  writeDim("  ./tied-install.sh --refresh --targets-only-installed --targets ~/clients.yaml");
  writeDim("  ./tied-install.sh --targets-plan --targets ./clients.yaml");
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
  writeDim("  --migrate-ordered-list-keys          Rename legacy ordered-command YAML keys in tied-project/ (see tied-bundle/docs/detail-files-schema.md § Set vs ordered list keys)");
  writeDim("  --fail-if-pending                    With --migrate-ordered-list-keys: exit 1 if migration still needed (CI; no writes)");
  writeDim("  --store                              With --migrate-layout --dry-run: store git mv plan");
  writeDim("  --dry-run                            With --migrate-layout or --migrate-ordered-list-keys: plan only");
  writeDim("  --merge-vocab                        Accepted for parity (full methodology only)");
  writeDim("  --methodology-readonly               Unix chmod for full methodology tree");
  writeDim("  --install-methodology-hook           Install client pre-commit hook template");
  writeDim("  Plus parity flags: --skip-parity-gate, --strict-refresh, etc.");
  writeDim("  Plus tool flags: --full-tools, --with-jev, --with-dae, --with-bbce");
  writeDim("  --targets PATH                       YAML list of client dirs (- for stdin); or set TIED_INSTALL_TARGETS");
  writeDim("  --targets-plan                       Print resolved paths; requires --targets (no install)");
  writeDim("  --targets-include|--targets-exclude GLOB  Filter batch list (* and **)");
  writeDim("  --targets-skip-missing               Drop list entries that are not directories");
  writeDim("  --targets-only-installed             Keep clients with tied-bundle/install.json");
  writeDim("  --targets-continue-on-error          Run all batch targets; exit 1 if any failed");
  process.stdout.write("\n");

  writeSection("Hints");
  writeDim("  • Missing MCP build: run ./build-workspace.sh from the TIED store root first.");
  writeDim("  • Legacy tied/ layout: use --migrate-layout before a normal install.");
  writeDim("  • Legacy evidence.commands / verification_commands in tied-project/: use --migrate-ordered-list-keys (requires built store mcp-server/dist).");
  writeDim("  • Store root equals client root: use --allow-self-install or a separate store clone.");
  writeDim("  • Windows: .\\tied-install.ps1 or tied-install.cmd (same behavior).");
  writeDim("  • No arguments prints this help; pass . to install the current directory.");
  writeDim("  • Batch refresh: list file is a YAML array of paths; sample: tools/bootstrap/fixtures/install-targets/sample.v1.yaml");
  writeHr();
  process.stdout.write("\n");
}
