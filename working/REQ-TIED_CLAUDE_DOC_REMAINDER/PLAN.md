# PLAN — REQ-TIED_CLAUDE_DOC_REMAINDER

**Status:** Remainder plan (doc + hygiene) — 2026-09-24  
**Linked comparison doc:** [`docs/comparisons/claude-code-tied-multi-harness-plan.md`](../../docs/comparisons/claude-code-tied-multi-harness-plan.md)  
**Does not reopen:** [`REQ-TIED_CLAUDE_HARNESS`](../../tied/requirements/REQ-TIED_CLAUDE_HARNESS.yaml), [`REQ-TIED_CLAUDE_BOOTSTRAP_OPS`](../../tied/requirements/REQ-TIED_CLAUDE_BOOTSTRAP_OPS.yaml), [`REQ-TIED_CLAUDE_LIVE_DRIVER`](../../tied/requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml) (all **Implemented** / closed unless sponsor opens a new REQ)

## Intent

After Phases 0→3 and follow-on REQs closed, the comparison doc still read like a **forward plan**. This working folder tracks **what remains**—doc truth, optional deferred slices, operator-only evidence, and LEAP hygiene—without inventing a fourth implementation REQ unless scope grows.

## Evidence snapshot (repo, 2026-09-24)

| Area | Evidence |
| --- | --- |
| Parent program | `REQ-TIED_CLAUDE_HARNESS` Implemented; close_out under `working/REQ-TIED_CLAUDE_HARNESS/gates/` |
| Bootstrap ops | `REQ-TIED_CLAUDE_BOOTSTRAP_OPS` Implemented; `program_phase: closed` in Tracker; B1/B2/B5 done; B3 deferred; B4 N/A |
| Live driver | `REQ-TIED_CLAUDE_LIVE_DRIVER` Implemented; `--harness claude` + `fixtures/claude/`; operator gate `AGENTSTREAM_CLAUDE_LIVE_OK=1` |
| Windows copy proof | `WINDOWS_COPY_PROVEN_IN_CI = true` in [`tools/bootstrap/lib/constants.mjs`](../../tools/bootstrap/lib/constants.mjs); CI per comparison Post–Phases table |
| Dual bootstrap | [`tools/bootstrap/README.md`](../../tools/bootstrap/README.md) § Claude Code harness; tests in [`claude-harness.test.mjs`](../../tools/bootstrap/lib/claude-harness.test.mjs) |

## Remaining slices (ordered)

| ID | Slice | Owner / token | Suggested entry | Acceptance |
| --- | --- | --- | --- | --- |
| **R1** | Comparison doc **Current vs Proposed** reconciliation + **What remains** section | This folder (doc-only) | **`refine-plan`** (this session) | Doc labels match repo; Last updated current; no false **Proposed** on shipped paths |
| **R2** ✅ | ~~Stale deferral note for B3~~ — **complete 2026-09-24** | LEAP hygiene — doc patch (R4 still owns full dual-REQ YAML LEAP) | **`build-plan`** (metadata-only) | Deferral doc matches `constants.mjs` + CITDP; B3 still **deferred** until sponsor scopes **R3** |
| **R3** ✅ | ~~Optional **repo-root `skills/` re-root** (B3 / CONFIG_SKILLS_REROOT)~~ — **complete 2026-09-24** | [`REQ-TIED_CLAUDE_SKILLS_REROOT`](../../tied/requirements/REQ-TIED_CLAUDE_SKILLS_REROOT.yaml) | **`build-plan`** R3 | `TIED_SKILLS_REROOT=1`; 17/17 harness tests; default off |
| **R4** ✅ | ~~Post-close-out **TIED YAML / Tracker / CHANGELOG LEAP** (dual child REQ hygiene)~~ — **complete 2026-09-24** | [`working/REFINE-DUAL_REQ_CLOSE_OUT/`](../../working/REFINE-DUAL_REQ_CLOSE_OUT/) | **`build-plan`** R4 slice | `tied_validate_consistency` ok; close_out gates allowed; envelope blocking gaps 0; traceable commit |

| **R5** | **Operator live** Claude checklist smoke (not CI) | Human operator | README: `AGENTSTREAM_CLAUDE_LIVE_OK=1` after local `npm test` | Optional receipt in `working/`; not a merge gate |
| **R6** | **Interactive Claude IDE** pilot (skill discovery, MCP auth in real session) | Optional operator / future spike REQ | Manual pilot per Phase 0 notes | Gap list update only if new unknowns found |
| **R7** | Replace **synthetic-v1** stream oracles with captured real CLI | Maintenance on `REQ-TIED_CLAUDE_LIVE_DRIVER` or small follow-on | **`build-plan`** | Frozen fixtures updated; README pin aligned |
| **R8** | Claude **adherence hook** bridge | Closed **N/A** (B4) | — | No work unless upstream hook contract stabilizes |

## Completed slices

| ID | Completed | Evidence |
| --- | --- | --- |
| **R2** | 2026-09-24 | [`skills-reroot-deferred.md`](../REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/skills-reroot-deferred.md); [`gate-verification-b2-b5-slice.md`](../REQ-TIED_CLAUDE_BOOTSTRAP_OPS/evidence/gate-verification-b2-b5-slice.md) close-out LEAP note |
| **R3** | 2026-09-24 | [`REQ-TIED_CLAUDE_SKILLS_REROOT`](../../tied/requirements/REQ-TIED_CLAUDE_SKILLS_REROOT.yaml); `tools/bootstrap/lib/skills-reroot.mjs`; `working/REQ-TIED_CLAUDE_SKILLS_REROOT/` |
| **R4** | 2026-09-24 | Dual REQ close-out: post-CI BOOTSTRAP LEAP + LIVE_DRIVER tracker/evidence hygiene; [`~/.cursor/plans/dual_req_close-out_commit_796ef67c.plan.md`](~/.cursor/plans/dual_req_close-out_commit_796ef67c.plan.md); refine notes [`working/REFINE-DUAL_REQ_CLOSE_OUT/refine-notes.md`](../REFINE-DUAL_REQ_CLOSE_OUT/refine-notes.md) |

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
| B3 after Windows proof | Proof is **in repo**; B3 remains **deferred by close-out**, not auto-unblocked (R3) |

## Vocabulary

PRELOAD: `agentstream.md`, `prompt-composer.md`, `tied-yaml-mcp.md`.  
RECORD: **program remainder**, **doc reconcile slice R1**.  
VALIDATE: at parent handoff (doc cites vs `tools/bootstrap/`, agentstream README).
