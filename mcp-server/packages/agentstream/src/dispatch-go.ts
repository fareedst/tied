/**
 * [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
 * Agentstream implementation selector (TS-only after Phase 4d).
 */

export const LEGACY_GO_REINSTALL_HINT =
  "TIED_AGENTSTREAM_IMPL=go was removed in Phase 4d. For emergency legacy Go agentstream, checkout a git tag from before Go removal (see working/REQ-TIED_UNIFIED_TOOLCHAIN/phase4c-deprecation-notice.md and phase4d-go-oracle-freeze.json).";

export function resolveAgentstreamImpl(): "go" | "ts" {
  const raw = (process.env.TIED_AGENTSTREAM_IMPL ?? "ts").trim().toLowerCase();
  if (raw === "go") {
    return "go";
  }
  if (raw !== "ts" && raw !== "") {
    console.error(
      `DIAGNOSTIC: unknown TIED_AGENTSTREAM_IMPL=${JSON.stringify(raw)}; using ts`,
    );
  }
  return "ts";
}

export function rejectLegacyGoImpl(): never {
  console.error(`agentstream: ${LEGACY_GO_REINSTALL_HINT}`);
  process.exit(2);
}

export function rejectUnqualifiedTsArgv(hint: string): never {
  console.error(`agentstream: ${hint}`);
  console.error(
    "DIAGNOSTIC: argv is not implemented in @tied/agentstream TS entry; see mcp-server/packages/agentstream/README.md",
  );
  process.exit(2);
}
