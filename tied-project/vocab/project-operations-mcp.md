# Project operations MCP (canonical)

**Scope:** Client vocabulary for MCP project-operation tools, the `/xlate` skill (Touchpoint 1 RESOLVE), the sponsor `/unblock` skill when **known or planned** costly choices block progress, **`/handoff`** chat continuity, **`/clear-workspace`** close-out orchestration, **`/feedback`** sponsor witness capture, and store-only **`/record-gf-trial`** greenfield facilitator ingest.

**Traceability:** [REQ-TIED_PROJECT_LINT](../requirements/REQ-TIED_PROJECT_LINT.yaml) · [REQ-TIED_GIT_HYGIENE](../requirements/REQ-TIED_GIT_HYGIENE.yaml) · [REQ-TIED_SPONSOR_QUESTIONS](../requirements/REQ-TIED_SPONSOR_QUESTIONS.yaml) · [REQ-TIED_XLATE_SKILL](../requirements/REQ-TIED_XLATE_SKILL.yaml) · [REQ-TIED_SESSION_HANDOFF_SKILL](../requirements/REQ-TIED_SESSION_HANDOFF_SKILL.yaml) · [REQ-TIED_CLEAR_WORKSPACE_SKILL](../requirements/REQ-TIED_CLEAR_WORKSPACE_SKILL.yaml) · [REQ-TIED_FEEDBACK_REPORT_SKILL](../requirements/REQ-TIED_FEEDBACK_REPORT_SKILL.yaml) · [REQ-TIED_CLIENT_BOOTSTRAP_SKILLS](../requirements/REQ-TIED_CLIENT_BOOTSTRAP_SKILLS.yaml)

**See also:** [`routing.md`](routing.md) (row **2c**) · [`domain-references.md`](domain-references.md) · [`tied-yaml-mcp.md`](tied-yaml-mcp.md) · [`sponsor-agent-relationship.md`](sponsor-agent-relationship.md) · [`tied-methodology.md`](tied-methodology.md)

---

## Preferred terms vs synonyms

| Term | Meaning |
|------|---------|
| `tied_project_lint` | Read-only MCP tool composing index validation, `tied_validate_consistency`, optional CITDP DAE sizing, optional pseudocode gate checks. |
| `tied_git_hygiene` | Preview-first git porcelain classifier; apply deletes **untracked** paths only when `allowed_paths` exactly matches the untracked set. |
| `tied_sponsor_questions` | Read-only costly-choice extractor using hinge validation, consequence ladder, and pending LEAP proposals. |
| `/xlate` | Explicit skill prefix for Touchpoint 1 RESOLVE; installed to `.cursor/skills/xlate`. |
| **xlate skill** | Bundled skill at `tools/bundled-xlate-skill/SKILL.md`; bootstrap install mirrors `tied-yaml`, not prompt-type bundle. |
| `/unblock` | Explicit skill prefix for sponsor decision sessions when **known or planned** costly choices block plan progress; prioritize answers that clear the most path toward completion. |
| **unblock skill** | Bundled skill at `tools/bundled-unblock-skill/SKILL.md`; `tied-install.sh` installs to `.cursor/skills/unblock` and `.claude/skills/unblock` (manifest `BUNDLED_STANDALONE_CLIENT_SKILLS`). |
| `/handoff` | Explicit skill for **chat continuity** between sessions; installed to `.cursor/skills/handoff`. |
| **handoff skill** | Bundled skill at `tools/bundled-session-handoff-skill/SKILL.md`; invoke name **`handoff`** (not `session-handoff`). |
| **`session-handoff.md`** | Evidence log under `tied-project/working/{REQ}/evidence/` — **artifact filename**, not the skill install name. |
| `/clear-workspace` | Orchestrator toward commit-ready workspace: git hygiene, `close-out`, `traceable-commit` prep as merited. |
| **clear-workspace skill** | Bundled skill at `tools/bundled-clear-workspace-skill/SKILL.md`; routing norm in `prompt-shared/clear-workspace-routing.md`. |
| `/feedback` | Explicit skill for sponsor **witness** reports of agent/client errors; Kaizen Phase 1 operational observation capture + **receipt** (not notification or countermeasure). |
| **feedback capture receipt** | Immediate local response from `/feedback` capture; confirms append to `feedback.yaml`; does not notify anyone or authorize canonical change. |
| **feedback skill** | Bundled skill at `tools/bundled-feedback-skill/SKILL.md`; manifest `BUNDLED_STANDALONE_CLIENT_SKILLS`. |
| `/record-gf-trial` | Explicit skill for **store** facilitators: inspect disposable greenfield client, publish `docs/demos/trial-readout-*.md`, optional Kaizen feedback ingest. |
| **record-gf-trial skill** | Bundled skill at `tools/bundled-record-gf-trial-skill/SKILL.md`; manifest **`STORE_FACILITATOR_SKILLS`** (store self-install only, not disposable clients). |
| **sponsor witness report** | Point-of-work account from the human sponsor who observed the failure; intake gate required before MCP write. |

## Boundaries

- Authoritative consistency remains **`tied_validate_consistency`**; lint composes diagnostics only.
- Checklist gate authority remains **`tied_checklist_gate_validate`** / **`tied_verify`**.
- Git hygiene does not commit, stage, or run destructive git commands beyond guarded untracked deletion.

## Alphabetical index

| Term | Section |
|------|---------|
| `/clear-workspace` | Preferred terms vs synonyms |
| `/feedback` | Preferred terms vs synonyms |
| `/handoff` | Preferred terms vs synonyms |
| `/record-gf-trial` | Preferred terms vs synonyms |
| `/unblock` | Preferred terms vs synonyms |
| `/xlate` | Preferred terms vs synonyms |
| **`session-handoff.md`** | Preferred terms vs synonyms |
| **clear-workspace skill** | Preferred terms vs synonyms |
| **feedback capture receipt** | Preferred terms vs synonyms |
| **feedback skill** | Preferred terms vs synonyms |
| **handoff skill** | Preferred terms vs synonyms |
| **record-gf-trial skill** | Preferred terms vs synonyms |
| **sponsor witness report** | Preferred terms vs synonyms |
| `tied_git_hygiene` | Preferred terms vs synonyms |
| `tied_project_lint` | Preferred terms vs synonyms |
| `tied_sponsor_questions` | Preferred terms vs synonyms |
| `unblock` skill | Preferred terms vs synonyms |
| `xlate` skill | Preferred terms vs synonyms |
