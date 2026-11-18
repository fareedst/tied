---
name: external-service-comparison
description: "Explicit-only three-wave external repository or article comparison (Wave 1 stub index, Wave 2 TIED analysis, Wave 3 handoff-only) with no in-repo vendor source copy. Use when the caller names external-service-comparison or @external-service-comparison with an HTTPS URL and/or absolute local path. Do not use for add-feature, build-plan on REQ behavior, or substituting tied_checklist_gate_validate."
disable-model-invocation: true
---

# external-service-comparison

Explicit invocation only (`@external-service-comparison` or `prompt-type: external-service-comparison`).

This skill standardizes read-only **external service comparison** for TIED operators.
`tied-install.sh` installs it under `.cursor/skills/external-service-comparison/`.
[REQ-TIED_EXTERNAL_SERVICE_COMPARISON] [ARCH-TIED_EXTERNAL_SERVICE_COMPARISON]
[IMPL-TIED_EXTERNAL_SERVICE_COMPARISON]

## Inputs

- **Source:** HTTPS URL and/or absolute local filesystem path (required unless sponsor supplies in remainder).
- **Invocation remainder:** optional topic slug hint, scope notes, or Wave 3 deferrals.

## TIED applicability

**Minimal** on each invocation — outreach documents only. Not a substitute for
`add-feature`, `refine-plan`, `build-plan`, or `close-out`.

**Canonical template:** `tied-bundle/docs/external-service-three-wave-comparison-template.md`
(clients: same path after `tied-install` refresh).

**No-source-copy (Waves 1–3):** Read vendor material off-repo; committed artifacts are **link + metadata + paraphrased TL;DR** only. They **do not reproduce** article bodies, README dumps, HTML extracts, or vendored source trees.

## Procedure

1. **RESOLVE** vendor/topic; derive kebab-case `{SLUG}`; ask when source or slug is ambiguous.
2. **Session bootstrap:** acknowledge AI principles; PRELOAD routed glossaries per `tied-project/vocab/routing.md`; read the comparison template.
3. **Working folder:** create `tied-project/working/DOC-{SLUG}-COMPARISON/` with `PLAN-refine-pass1.md`, `checklist-tracker-refine.yaml`, and `evidence/` **before** writing comparison markdown.
4. **Distinct from:** record sibling comparisons (Traefik, LangChain, Cursor, Open Ontologies, AI-SDLC, etc.) in the working plan — no scope duplication.
5. **Evidence (read-only):** inspect README, architecture, workflows, CI, bundled skills for repos; fetch URLs; use read-only GitHub API or ephemeral local checkout **outside** committed paths when needed. Record **target-repo-observed** identity in paraphrase only. Write `evidence/url-fetch-receipt.md` (themes, URL, date — **no pasted body**). Do **not** run target tests, vendor MCP servers, or untrusted scripts unless separately scoped.
6. **Wave 1 (stub):** `docs/comparisons/{vendor}-{topic}.md` — metadata table whose **Purpose** states link + summary only and **does not reproduce** the article body; required section **Why this file has no article body**; **TL;DR** paraphrase only; label vendor claims **{Vendor}-reported**; optional **Notes for stdd readers** with Wave 2 sibling link.
7. **Wave 2:** `docs/comparisons/{vendor}-{topic}-vs-tied-agent-management.md` (or `-vs-tied.md`) — all **14 template sections**, capability matrix, authority boundary, anti-patterns (include “Pasting vendor article into repository paths”), bounded **Recommendation-only** items, phased Wave 3 candidates, explicit non-adoptions, proof boundary. **Source summary** is TIED paraphrase — do not re-paste the Wave 1 stub or vendor prose.
8. **Git allowlist:** add root `.gitignore` `!docs/comparisons/…` entries for new files.
9. **Verify:** claim labels (`target-repo-observed`, `{Vendor}-reported`, `TIED-existing`, `Recommendation-only`, `Defer`, `not_measured`); stub marker on Wave 1 article captures; relative links; section parity; no token mint in prose. Skip `tied_validate_consistency` when no project YAML changed.
10. **Wave 3 handoff:** doc/skill compose may be proposed with **TIED-owned prose** only (cite URLs; **no source copy** into `tied-bundle/docs/`, skills, or working evidence). Enforced behavior, YAML, gates, or requirements route to **`add-feature`** / **`build-plan`** only.

## Gates

- This skill **does not** call **`tied_checklist_gate_validate`** on behalf of implement-complete claims.
- **`tied_verify`**, **`pseudocode_validate`**, and checklist gates remain authoritative for TIED-tracked implement and close-out.
- If a later Wave 3 REQ mutates project YAML: **`tied_config_get_base_path`** then TIED MCP / **`tied-cli.sh`** only.

## Forbidden

- Committing vendor **article body**, scraped sections, companion `.txt`/`.html` extracts, or vendor **source trees** under repo paths (Waves **1–3**)
- Pasting vendor README or post prose into Wave 2 analysis, Wave 3 compose docs, or skills
- Vendor metrics, badges, certificates, or self-verify as **TIED effectiveness** proof
- Project REQ/ARCH/IMPL YAML writes from comparison prose or this skill's Wave 1–2 outputs
- Language that **`tied_checklist_gate_validate`** outcomes are waived or replaced
- Automatic LEAP or `[REQ-*]` / `[ARCH-*]` / `[IMPL-*]` mint from comparison text
- **`pbpaste`** / **`pbcopy`**; automatic git stage, commit, or push

## Outputs

- Wave 1 stub index and Wave 2 analysis under `docs/comparisons/`
- DOC working folder plan, tracker, and evidence paths (themes-only receipts)
- Wave 3 handoff listing promotion path (doc-only vs scoped REQ)