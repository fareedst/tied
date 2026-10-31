# Workspace clear handoff — 2026-10-31

**Goal:** `git status` clean on `main` — every dirty path **committed** (evidence) or **wiped** (regenerable / test pollution).

**Baseline before clear:** `131f0011` (corpus G3) · branch **2 commits ahead** of `origin/main`.

## Staging map (commit)

| Bucket | Paths | Rationale |
| --- | --- | --- |
| **A — Brownfield program** | `tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/` (modified + `evidence/gap-planning-handoff.md`) | Post–close-out gap routing; session/edpc/claims updates from G3 planning arc |
| **B — Corpus close-out** | `tied-project/working/REQ-TIED_CORPUS_COMPREHENSION/evidence/*` (untracked step-evidence MDs + handoff SHA) | Close-out process contract; omitted from `131f0011` |
| **C — Closed REQ trackers** | `tied-project/working/REQ-TIED_DURABLE_CHECKLIST_CONTROLLER/` (tracker + working CITDP), `tied-project/citdp/CITDP-REQ-TIED_DURABLE_CHECKLIST_CONTROLLER-LEAP-UNIFY.yaml`, `tied-project/working/REQ-TIED_WORKFLOW_VISUALIZATION_SKILL/checklist-tracker.yaml` | Prior LEAP / close-out evidence ref sync |

**Exclude from commit:** `tied-project/working/DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/source-graph-index.v1.json` (regenerable; see brownfield session-handoff).

## Wipe map (restore / delete)

| Class | Paths | Action |
| --- | --- | --- |
| **Gate test CITDP litter** | `tied-project/citdp/CITDP-REQ-{ACTIVATION,NESTED,PRESERVE,UNIT_TEST,UPGRADE,UPGRADE-MISSING}.yaml` | `git clean -f` |
| **Runtime identity markers** | `project-identity.v1.yaml`, `tied-bundle/project-identity.v1.yaml` | delete (path_fallback; not product config) |
| **Regenerable graphs** | `tied-bundle/reports/source-graph/source-graph-index.v1.json`, `mcp-server/test/fixtures/source-graph/mini-repo/tied-bundle/reports/source-graph/source-graph-index.v1.json` | `git restore` |
| **Fixture envelope timestamps** | `mcp-server/test/fixtures/adversarial-inquiry*/**/request-evidence-envelope.v1.json` | `git restore` |
| **Gate fixture manifest** | `tied-project/working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/fixture-*/regression-manifest.json` | `git restore` |
| **In-flight REQ pollution** | `tied-project/working/REQ-TIED_INTENT_CONTROL_PLANE/checklist-tracker.yaml`, `tied-project/citdp/CITDP-REQ-TIED_INTENT_CONTROL_PLANE.yaml`, `tied-project/requirements/REQ-TIED_INTENT_CONTROL_PLANE.yaml`, `tied-project/working/REQ-TIED_INTENT_CONTROL_PLANE/CITDP-*.yaml` | `git restore` (tooling reformatted tracker + incidental criterion reorder) |
| **Benchmark run artifact** | `tied-project/working/REQ-TIED_JEV_CONTEXT_LOG_PRUNING/evidence/context-pruning-benchmark.v1.json` | `git restore` |

## Execution checklist

- [x] Stage buckets A–C; run `git diff --cached --stat`
- [x] Wipe map (restore + clean)
- [x] Commits: `a12c5957` → `7508ffa9` → `b50ba387` (working sync + this handoff)
- [x] Confirm `git status` empty
- [ ] Optional: `git push` (sponsor)

## After clean

| Track | Entry |
| --- | --- |
| Brownfield gaps | [gap-planning-handoff.md](../DOC-STDD-TIED-PROJECT-BROWNFIELD/evidence/gap-planning-handoff.md) — G3 done (`131f0011`+); next G1/G4/G5/G7 or republish |
| Corpus REQ | [close-out-handoff.md](../REQ-TIED_CORPUS_COMPREHENSION/evidence/close-out-handoff.md) |
| Intent control plane | Resume from last committed tracker on `main` after wipe |

## Completion signal

**Workspace clean:** `git status --porcelain` returns empty (excluding ignored).

**Recorded commits:**

| SHA | Message |
| --- | --- |
| `a12c5957` | docs(brownfield): gap planning handoff and post-close-out session sync |
| `7508ffa9` | docs(corpus): close-out step evidence and handoff commit SHA |
| `b50ba387` | chore(working): sync closed REQ trackers and workspace-clear handoff |

**Branch:** `main` is **5 commits ahead** of `origin/main` (not pushed).
