# PLAN — REQ-TIED_CLAUDE_DOC_REMAINDER

**Status:** Remainder program **closed** — 2026-09-24 (R1–R8 complete)  
**Linked comparison doc:** [`docs/comparisons/claude-code-tied-multi-harness-plan.md`](../../docs/comparisons/claude-code-tied-multi-harness-plan.md)  
**Does not reopen:** [`REQ-TIED_CLAUDE_HARNESS`](../../tied/requirements/REQ-TIED_CLAUDE_HARNESS.yaml), [`REQ-TIED_CLAUDE_BOOTSTRAP_OPS`](../../tied/requirements/REQ-TIED_CLAUDE_BOOTSTRAP_OPS.yaml), [`REQ-TIED_CLAUDE_LIVE_DRIVER`](../../tied/requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml) (all **Implemented** / closed unless sponsor opens a new REQ)

## Intent

After Phases 0→3 and follow-on REQs closed, the comparison doc still read like a **forward plan**. This working folder tracks **what remains**—doc truth, optional deferred slices, operator-only evidence, and LEAP hygiene—without inventing a fourth implementation REQ unless scope grows.

## Evidence snapshot (repo, 2026-09-24)

| Area | Evidence |
| --- | --- |
| Parent program | `REQ-TIED_CLAUDE_HARNESS` Implemented; close_out under `working/REQ-TIED_CLAUDE_HARNESS/gates/` |
| Bootstrap ops | `REQ-TIED_CLAUDE_BOOTSTRAP_OPS` Implemented; `program_phase: closed` in Tracker; B1/B2/B5 done; B4 N/A; B3 shipped via **`REQ-TIED_CLAUDE_SKILLS_REROOT`** (`TIED_SKILLS_REROOT=1`, default off) |
| Live driver | `REQ-TIED_CLAUDE_LIVE_DRIVER` Implemented; `--harness claude` + `fixtures/claude/`; operator gate `AGENTSTREAM_CLAUDE_LIVE_OK=1` |
| Windows copy proof | `WINDOWS_COPY_PROVEN_IN_CI = true` in [`tools/bootstrap/lib/constants.mjs`](../../tools/bootstrap/lib/constants.mjs); CI per comparison Post–Phases table |
| Dual bootstrap | [`tools/bootstrap/README.md`](../../tools/bootstrap/README.md) § Claude Code harness; tests in [`claude-harness.test.mjs`](../../tools/bootstrap/lib/claude-harness.test.mjs) |

## Remaining slices (ordered)

| ID | Slice | Owner / token | Suggested entry | Acceptance |
| --- | --- | --- | --- | --- |
| ~~**R1**~~ ✅ | ~~Comparison doc **Current vs Proposed** reconciliation~~ — **complete 2026-09-24** | Doc-only | **`build-plan`** R1 | [`evidence/r1-doc-reconcile-receipt.md`](evidence/r1-doc-reconcile-receipt.md) |
| **R2** ✅ | ~~Stale deferral note for B3~~ — **complete 2026-09-24** | LEAP hygiene — doc patch (R4 still owns full dual-REQ YAML LEAP) | **`build-plan`** (metadata-only) | Deferral note superseded by **R3** ship |
| **R3** ✅ | ~~Optional **repo-root `skills/` re-root** (B3 / CONFIG_SKILLS_REROOT)~~ — **complete 2026-09-24** | [`REQ-TIED_CLAUDE_SKILLS_REROOT`](../../tied/requirements/REQ-TIED_CLAUDE_SKILLS_REROOT.yaml) | **`build-plan`** R3 | `TIED_SKILLS_REROOT=1`; 17/17 harness tests; default off |
| **R4** ✅ | ~~Post-close-out **TIED YAML / Tracker / CHANGELOG LEAP** (dual child REQ hygiene)~~ — **complete 2026-09-24** | [`working/REFINE-DUAL_REQ_CLOSE_OUT/`](../../working/REFINE-DUAL_REQ_CLOSE_OUT/) | **`build-plan`** R4 slice | `tied_validate_consistency` ok; close_out gates allowed; envelope blocking gaps 0; traceable commit |

| ~~**R5**~~ ✅ | ~~**Operator live** Claude checklist smoke (not CI)~~ — **complete 2026-09-24** | Human operator | README + [`evidence/operator-live-claude-smoke-r5.md`](evidence/operator-live-claude-smoke-r5.md) | Preflight 52/52; live subprocess deferred (no `claude` CLI in build agent env) |
| ~~**R6**~~ ✅ | ~~**Interactive Claude IDE** pilot~~ — **complete 2026-09-24** (runbook + preflight; IDE session deferred) | Optional operator / future spike REQ | Manual pilot per Phase 0 notes | [`evidence/operator-interactive-claude-ide-r6.md`](evidence/operator-interactive-claude-ide-r6.md) |
| ~~**R7**~~ ✅ | ~~Replace **synthetic-v1** stream oracles with captured real CLI~~ — **complete 2026-09-24** | Maintenance on `REQ-TIED_CLAUDE_LIVE_DRIVER` | **`build-plan`** | CLI **2.1.273** pinned; fixtures + parser error `result` shape |
| ~~**R8**~~ ✅ | ~~Claude **adherence hook** bridge~~ — **N/A close-out 2026-09-24** | Closed **N/A** (B4) | — | Re-probe confirms no stable upstream contract; [`evidence/r8-adherence-hook-bridge-na.md`](evidence/r8-adherence-hook-bridge-na.md) |

## Completed slices

| ID | Completed | Evidence |
| --- | --- | --- |
| **R1** | 2026-09-24 | [`evidence/r1-doc-reconcile-receipt.md`](evidence/r1-doc-reconcile-receipt.md); comparison doc **What remains — program closed** |
| **R2** | 2026-09-24 | [`skills-reroot-deferred.md`](../REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/skills-reroot-deferred.md); [`gate-verification-b2-b5-slice.md`](../REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/gate-verification-b2-b5-slice.md) close-out LEAP note |
| **R3** | 2026-09-24 | [`REQ-TIED_CLAUDE_SKILLS_REROOT`](../../tied/requirements/REQ-TIED_CLAUDE_SKILLS_REROOT.yaml); `tools/bootstrap/lib/skills-reroot.mjs`; `working/REQ-TIED_CLAUDE_SKILLS_REROOT/` |
| **R4** | 2026-09-24 | Dual REQ close-out: post-CI BOOTSTRAP LEAP + LIVE_DRIVER tracker/evidence hygiene; [`~/.cursor/plans/dual_req_close-out_commit_796ef67c.plan.md`](~/.cursor/plans/dual_req_close-out_commit_796ef67c.plan.md); refine notes [`working/REFINE-DUAL_REQ_CLOSE_OUT/refine-notes.md`](../REFINE-DUAL_REQ_CLOSE_OUT/refine-notes.md) |
| **R5** | 2026-09-24 | [`evidence/operator-live-claude-smoke-r5.md`](evidence/operator-live-claude-smoke-r5.md); [`evidence/agentstream-npm-test-r5-stdout.txt`](evidence/agentstream-npm-test-r5-stdout.txt); README § Operator live smoke |
| **R6** | 2026-09-24 | [`evidence/operator-interactive-claude-ide-r6.md`](evidence/operator-interactive-claude-ide-r6.md); [`evidence/claude-harness-test-r6-stdout.txt`](evidence/claude-harness-test-r6-stdout.txt); gap list § R6 cross-reference |
| **R7** | 2026-09-24 | [`evidence/r7-cli-oracle-capture-receipt.md`](evidence/r7-cli-oracle-capture-receipt.md); [`evidence/agentstream-npm-test-r7-stdout.txt`](evidence/agentstream-npm-test-r7-stdout.txt); `fixtures/claude/` NDJSON + README pin **2.1.273** |
| **R8** | 2026-09-24 | [`evidence/r8-adherence-hook-bridge-na.md`](evidence/r8-adherence-hook-bridge-na.md); B4 [`adherence-spike-na.md`](../REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/adherence-spike-na.md); **RISK-BOOT-005** |

## Non-goals

- Re-running full Phases 0→3 implementation
- MCP writes to closed REQ satisfaction criteria without sponsor LEAP
- Claiming live Claude automation from doc edits alone

## Depth policy (this refine)

- `depth_tier`: **minimal** (documentation + plan reconcile)
- `gate_policy`: **advisory**
- `profile_depth`: **minimal**

## Artifacts

| Artifact | Path |
| --- | --- |
| Remainder plan | `working/REQ-TIED_CLAUDE_DOC_REMAINDER/PLAN.md` (this file) |
| Inline CITDP | `working/REQ-TIED_CLAUDE_DOC_REMAINDER/citdp-inline.yaml` |
| Tracker (refine gate) | `working/REQ-TIED_CLAUDE_DOC_REMAINDER/checklist-tracker.yaml` |

## Resolved sponsor terms

| Sponsor term | Resolution |
| --- | --- |
| “Most of this completed; plan what remains” | R1–R8 table above; comparison doc **What remains** mirrors R1–R8 for readers |
| Doc maintenance vs new REQ | **No new REQ token** for R1; use this working folder name for traceability |
| B3 after Windows proof | Proof **in repo**; **R3** shipped optional re-root — default remains harness-native paths |

## Vocabulary

PRELOAD: `agentstream.md`, `prompt-composer.md`, `tied-yaml-mcp.md`.  
RECORD: **program remainder**, **doc reconcile slice R1**.  
VALIDATE: at parent handoff (doc cites vs `tools/bootstrap/`, agentstream README).
