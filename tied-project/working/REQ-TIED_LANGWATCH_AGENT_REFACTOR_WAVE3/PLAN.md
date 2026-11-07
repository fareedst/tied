# Implementation plan — LangWatch 51-day refactor × TIED Wave 3 (bounded operator compose)

| Field | Value |
| --- | --- |
| **request_token** | `REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3` |
| **working_slug** | `REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3` |
| **Primary source** | [langwatch-rebuilding-51-days-vs-tied-agent-management.md](../../../docs/comparisons/langwatch-rebuilding-51-days-vs-tied-agent-management.md) (operator-local / gitignored) |
| **Non-tied handoff** | [langwatch-rebuilding-51-days-capture/evidence/session-handoff.md](../../non-tied-plans/langwatch-rebuilding-51-days-capture/evidence/session-handoff.md) |
| **Cursor plan** | `/Users/fareed/.cursor/plans/langwatch_wave_3_add-feature_cc4999a0.plan.md` |
| **CITDP** | [CITDP-REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3.yaml](../../citdp/CITDP-REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3.yaml) |
| **Tracker** | [checklist-tracker.yaml](checklist-tracker.yaml) |
| **Test strategy** | [test-strategy.md](test-strategy.md) |
| **depth_tier** | `minimal` |
| **gate_policy** | `advisory` |
| **methodology_surface_change_class** | `none` |
| **Operator interruption budget** | Bundle/docs + handoff norm only; no MCP gate tools; comparisons stay gitignored |

---

## 1. Refine (Touchpoint 1 — RESOLVE)

### Intent authority

- **Sponsor intent:** Institutionalize LangWatch Wave 2 **bounded operator recommendations** as committed methodology/docs (port backlog handoff, eval Q5/Q1 literacy, HTOL source study, incident-revert **merge_miss**, matrix §2 row **18**) — **not** LangWatch product adoption or evaluation-charter static adapter.
- **Sponsor policy:** Comparison markdown **local-only** (no allowlist in build-plan).
- **RESOLVE terms:** **port backlog** (owed-ports disk ledger); **merge_miss** (sponsor-confirmed merge/port defect row kind); **LangWatch-reported** (external narrative control only).

### RESOLVE table (bounded rec → surface)

| # | Wave 2 rec | Surface |
| --- | --- | --- |
| 1 | Pair LangChain trace loops | Row 18 sponsor_notes + HTOL study |
| 2–3 | Q5/Q1 discipline | [tied-methodology-evaluation-framework.md](../../../docs/tied-methodology-evaluation-framework.md) subsection |
| 4 | Owed-ports | [session-handoff-structure.md](../../../tools/bundled-prompt-type-skills/prompt-shared/session-handoff-structure.md) **Port backlog** |
| 5 | E2E trace | [pre-handoff-verification-charter.md](../../../tied-bundle/docs/pre-handoff-verification-charter.md) |
| 6 | Base path | [langwatch-bounded-operator-skim.md](langwatch-bounded-operator-skim.md) → HPS checklist |
| 7 | Local capture | PLAN constraint only |

**PRELOAD:** [quality-assurance.md](../../vocab/quality-assurance.md), [fidelity-research.md](../../vocab/fidelity-research.md), [sponsor-agent-relationship.md](../../vocab/sponsor-agent-relationship.md), [feedback-to-tied.md](../../vocab/feedback-to-tied.md).

### Consequence ladder

| Decision | Ladder | Disposition |
| --- | --- | --- |
| Matrix row **17→18** + handoff port norm | **Costly** | **Do** (sponsor doc-compose 2026-11-07) |
| Static comparable-arms adapter | **Costly** | **Defer** (separate future REQ) |
| LangWatch lint/ADR as YAML SoT | **Costly** | **Do not** |
| `.gitignore` comparison allowlist | **Costly** | **Do not** (sponsor local-only) |

---

## 2. Compose-don't-replace

| Harness / outreach (tune) | Platform authority (keep) |
| --- | --- |
| Port backlog, HTOL LangWatch study, eval narrative literacy | `tied_checklist_gate_validate`, MCP YAML, `tied_verify` |
| merge_miss corpus rows (operator-local) | Confirmed finding / fidelity promotion path |
| Matrix row 18 inventory | LEAP proposal queue for rule changes |

---

## 3. Draft §2 row 18

| Column | Draft |
| --- | --- |
| **#** | 18 |
| **Framework** | LangWatch large-scale **agent-directed refactor** (module contracts, lint cage, merge/port ledger compose) |
| **Loop(s)** | 1–2 |
| **Disposition** | **Composable** |
| **TIED center of gravity** | Harness-adjacent structure discipline vs platform REQ/ARCH/IMPL + gates |
| **Evidence refs** | HTOL, incident-revert corpus, HPS authority checklist, rows 13–15, REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3 |
| **sponsor_notes** | **LangWatch-reported** only; pair rows **14–15**; owed-ports ≠ TIED merge automation |

---

## 4. Phased slices (build-plan)

| Order | Slice | Deliverable |
| ---: | --- | --- |
| 1 | **F** | REQ/ARCH/IMPL minted at refine-plan |
| 2 | **A-test** | RED → GREEN: `methodology-composition-matrix-langwatch-row.test.mjs` |
| 3 | **A** | Matrix row 18 + LEAP SC-MCM-DOC **18** |
| 4 | **B** | Eval framework Q5/Q1 LangWatch narrative-control subsection |
| 5 | **C-test** | RED extend `harness-trace-observation-loop-doc.test.mjs` |
| 6 | **C** | HTOL LangWatch source study |
| 7 | **D-test** | RED extend `incident-revert-eval-corpus-doc.test.mjs` (`merge_miss`) |
| 8 | **D** | Corpus doc + template example row |
| 9 | **E-test** | RED extend `session-handoff-structure-doc.test.mjs` (Port backlog) |
| 10 | **E** | Handoff structure + template + [langwatch-bounded-operator-skim.md](langwatch-bounded-operator-skim.md) |
| 11 | **F** | Pre-handoff charter + HPS cross-links |
| 12 | **G** | Three-wave template + client-development-index |
| 13 | **H** | `tied_validate_consistency` + verification gate |

**Forbidden:** LangWatch product/haven/lane agents; oxlint as `tied_validate_consistency` substitute; editing gitignored comparison bodies; new MCP gates.

---

## 5. RED test contract (slice A)

Mirror [methodology-composition-matrix-langchain-row.test.mjs](../../../tools/bootstrap/lib/methodology-composition-matrix-langchain-row.test.mjs): expect **18** §2 rows, row **18** line with **LangWatch-reported**, rows **14–15** pairing.

---

## 6. Test strategy

See [test-strategy.md](test-strategy.md).

---

## 7. Implement handoff

Run **`@build-plan`** after **`pre_implementation` gate allowed**.

**Gate operator recipe:**

```bash
.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_gate_check "$(cat <<'EOF'
{
  "request_token": "REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3",
  "phase": "pre_implementation",
  "project_root": "/Users/fareed/Documents/dev/chatgpt/stdd",
  "citdp_path": "tied-project/citdp/CITDP-REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3.yaml",
  "tracker_path": "tied-project/working/REQ-TIED_LANGWATCH_AGENT_REFACTOR_WAVE3/checklist-tracker.yaml"
}
EOF
)"
```

---

## 8. Gate status (refine-plan)

**`pre_implementation` (2026-11-07, pass 1):** `tied_gate_check` → **`allowed: true`**. **`verification` (2026-11-07, build-plan):** `tied_gate_check` → **`allowed: true`** ([verification-gate-build-plan.json](evidence/verification-gate-build-plan.json)). Bootstrap doc tests GREEN; matrix §2 row **18**; LEAP SC-MCM-DOC **18** on [REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX](../../requirements/REQ-TIED_METHODOLOGY_COMPOSITION_MATRIX.yaml).
