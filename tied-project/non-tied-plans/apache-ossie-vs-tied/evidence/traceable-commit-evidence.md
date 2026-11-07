# Traceable commit evidence — apache-ossie-vs-tied

**Date:** 2026-11-07  
**Slug:** `apache-ossie-vs-tied`  
**Prior commit:** `f44d4729` — plan package only

## Scoped paths (this effort)

| Path | Role |
| --- | --- |
| `.gitignore` | Allowlist `apache-ossie*.md`, NVIDIA × TIED sibling cross-link |
| `docs/comparisons/apache-ossie.md` | Wave 1 capture |
| `docs/comparisons/apache-ossie-vs-tied-agent-management.md` | Wave 2 analysis (Q1–Q6, 14 sections) |
| `docs/comparisons/nvidia-auto-ontology-vs-tied-agent-management.md` | Reciprocal **Distinct from** (Ossie interchange vs catalog) |
| `tied-project/non-tied-plans/apache-ossie-vs-tied/evidence/session-handoff.md` | `publish-allowlist` complete |
| `tied-project/non-tied-plans/apache-ossie-vs-tied/evidence/traceable-commit-evidence.md` | This file |

## Verification (pre-commit)

```text
static_only evidence; wc -l apache-ossie.md apache-ossie-vs-tied-agent-management.md
git check-ignore -v (must not ignore allowlisted paths after .gitignore edit)
No REQ/ARCH/IMPL mint in comparison bodies
```

## Excluded

- Unrelated `tied-project/working/*` drift, LangGraph P7, facilitator WF folders, other gitignored comparisons
- `docs/comparisons/nvidia-auto-ontology.md` capture (unchanged this effort; still ignored)
- Evaluation corpus / project YAML MCP writes

## Vocabulary

Touchpoint 3: **semantic model (Ossie)**, **interchange**, **structural vs conceptual interoperability** — documented in comparison prose only; no `tied-project/vocab/` edits this slug.
