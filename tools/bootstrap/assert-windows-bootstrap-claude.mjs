#!/usr/bin/env node
/**
 * [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [ARCH-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]
 * How: CLI entry for scripts/windows-bootstrap-smoke.cmd — exit 1 with FAIL message on assert violation.
 */
import { assertWindowsBootstrapClaude } from "./lib/assert-windows-bootstrap-claude.mjs";
import { skillsRerootEnabledFromEnv } from "./lib/skills-reroot.mjs";

const smokeRoot = process.argv[2];
if (!smokeRoot) {
  console.error("Usage: node tools/bootstrap/assert-windows-bootstrap-claude.mjs <smoke-client-root>");
  process.exit(2);
}

const result = assertWindowsBootstrapClaude(smokeRoot, {
  skills_reroot_enabled: skillsRerootEnabledFromEnv(process.env),
});
if (!result.ok) {
  console.error(result.message);
  process.exit(1);
}

console.log("OK: Claude Windows bootstrap asserts (%s)", result.asserts.join(", "));
process.exit(0);
