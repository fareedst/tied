# Traceable commit evidence — REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT

## Gates

- **close_out:** `allowed: true` — receipt `tied-bundle/working/REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT/gates/close_out-2026-11-12T22-05-48-981Z.json` (regenerable; not staged)
- **Envelope:** `request-evidence-envelope.v1.json` — blocking_gaps=0 (gitignored regenerable)

## Tests

```
node --test tools/bootstrap/lib/project-size-comparison-render.test.mjs — 13/13 pass (includes SC-CSC-11)
```

## tied_validate_consistency

Run 2026-11-12: **pre-existing** traceability failures from unstaged `REQ-WF_TRIAL_PROOF_MANIFEST_SUBTYPE_GATE` (missing related REQ index entries). **REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT** tokens report valid in detail_files.

## Vocab VALIDATE

Display-only facilitator terms (`display label`, `summaryEpochMin`, cross-layer column order) align with PLAN and existing project-size facilitator docs; no new vocab files required.

## Upstream feedback capture

**N/A** — no MCP `tied_feedback_*` ingest in this close-out pass.

## Hygiene receipt

`tied-project/working/REQ-TIED_PROJECT_SIZE_COMPARISON_SUMMARY_COMPACT/evidence/git-hygiene-receipt-2026-11-12.md`

## Excluded unrelated drift

See hygiene receipt.
