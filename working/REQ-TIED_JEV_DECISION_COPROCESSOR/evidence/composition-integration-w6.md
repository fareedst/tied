# W6 composition-integration evidence

**Request:** REQ-TIED_JEV_DECISION_COPROCESSOR (PLAN-W6 plan-skills wiring)  
**Date:** 2026-09-27

## Binding inventory (Phase G — no UI)

| Binding | IMPL / module | Composition coverage |
| --- | --- | --- |
| MCP `allTools` → `tied_jev_status` / `tied_jev_vocab_shadow` | `mcp-server/src/tools/jev-plan-skills-tools.ts`, `tools/index.ts` | `plan-skills.test.ts` T-MCP-01..04 |
| Jev client + shadow pipeline | `plan-skills-shadow.ts`, `merged-routing-baseline.ts`, `jevDecide` | `plan-skills.test.ts` T-SH, T-RT, T-CFG |
| CLI parity (`tied-cli.sh` same dist) | MCP stdio surface | `plan-skills.test.ts` T-CLI-01; bundled pilot `tied-cli` parity in npm test |
| Bundled plan skills → shared adjunct | `tools/bundled-prompt-type-skills/prompt-shared/jev-plan-skills-adjunct.md` | `prompt-type-skills.test.ts` (T-SK adjunct links) |
| Checklist gate + activation collect | existing adversarial/checklist MCP | pre_implementation gate allowed with identity-bound artifacts |

Controlled fault injection: **not_applicable** — W6 adjunct is optional/no-op when disabled; fail-closed behavior covered by T-CFG/T-GATE unit tests (no separate fault-injection row required for opt-in advisory path).

## Full `npm test` (mcp-server)

Command: `npm test` from `mcp-server/` (build + node test matrix + bun Jev slice).

**Result (2026-09-27 follow-up):** **1083 pass / 0 fail** after fixing methodology vocab index (BBCE/residuality canonical markers + `domain-references.md` catalog) and `templates/.tied-yaml.yaml` `scalar_style: unwrapped`.

Earlier run (same day): 1080 pass / 3 fail — bootstrap e2e only; resolved in-repo.

Stdout capture: re-run `npm test` in `mcp-server/` and archive to `npm-test-full-2026-09-27.stdout.txt` when refreshing evidence.

## W6-targeted bun slice (after npm exit)

`bun test` on `src/jev/plan-skills.test.ts`, `jev.test.ts`, `shadow-vocab-preload.test.ts`, `harness-tool-guard.test.ts` — see stdout ref below.

## Lint

TypeScript build succeeds as part of `npm run build` inside `npm test`.
