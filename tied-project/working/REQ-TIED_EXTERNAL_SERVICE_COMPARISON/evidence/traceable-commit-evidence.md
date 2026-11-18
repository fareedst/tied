# Traceable commit evidence — stub-capture-policy

| Field | Value |
| --- | --- |
| **work_item** | stub-capture-policy |
| **run_id** | close-out-esc-stub-capture-2026-11-17-r2 |
| **gate** | `merged_decision.allowed: true`, `blocking_gap_count: 0` |

## Commands

```bash
node --test tools/bootstrap/lib/external-service-comparison-skill.test.mjs tools/bootstrap/lib/comparison-capture-stub-policy.test.mjs
pseudocode_validate IMPL-TIED_EXTERNAL_SERVICE_COMPARISON gate_mode  # ok
```

## Staging map

- `tools/bundled-prompt-type-skills/external-service-comparison/*`
- `tools/bootstrap/lib/external-service-comparison-skill.test.mjs`
- `tools/bootstrap/lib/comparison-capture-stub-policy.test.mjs`
- `tied-bundle/docs/external-service-three-wave-comparison-template.md`
- `tied-project/requirements/REQ-TIED_EXTERNAL_SERVICE_COMPARISON.yaml`
- `tied-project/architecture-decisions/ARCH-TIED_EXTERNAL_SERVICE_COMPARISON.yaml`
- `tied-project/implementation-decisions/IMPL-TIED_EXTERNAL_SERVICE_COMPARISON.yaml`
- `tied-project/implementation-decisions/IMPL-TIED_EXTERNAL_SERVICE_COMPARISON-pseudocode.md`
- `tied-project/citdp/CITDP-REQ-TIED_EXTERNAL_SERVICE_COMPARISON-stub-policy.yaml`
- `tied-project/working/REQ-TIED_EXTERNAL_SERVICE_COMPARISON/PLAN-stub-capture-policy.md`
- `tied-project/working/REQ-TIED_EXTERNAL_SERVICE_COMPARISON/checklist-tracker-stub-capture-policy.yaml`
- `tied-project/working/REQ-TIED_EXTERNAL_SERVICE_COMPARISON/test-strategy-stub-capture-policy.md`
- `tied-project/working/REQ-TIED_EXTERNAL_SERVICE_COMPARISON/evidence/*` (stub policy pass)
- `tied-project/working/REQ-TIED_EXTERNAL_SERVICE_COMPARISON/PLAN.md` (follow-on link)
- `docs/comparisons/` allowlisted stub retrofits (7 tracked files)
- `CHANGELOG.md` (Unreleased bullet)

## Excluded drift

See `git-hygiene-receipt-2026-11-17.md`.

## Vocab VALIDATE

Deferred N/A — no new durable glossary terms shipped.

## Feedback capture

**N/A** — methodology store change.