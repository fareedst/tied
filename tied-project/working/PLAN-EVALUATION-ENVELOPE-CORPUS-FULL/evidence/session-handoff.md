# Session handoff — G5 full envelope corpus

**Date:** 2026-10-31  
**Plan:** `PLAN-EVALUATION-ENVELOPE-CORPUS-FULL`  
**Gap:** `process:envelope_sample_ten_tokens_not_full_corpus`

---

## Delivered

| Item | Path |
| --- | --- |
| Manifest builder | [tools/evaluation/build-envelope-corpus-manifest.mjs](../../../../tools/evaluation/build-envelope-corpus-manifest.mjs) |
| Corpus manifest (133 rows) | [envelope-corpus-manifest.v1.yaml](../../evaluation/envelope-corpus-manifest.v1.yaml) |
| Build summary | [envelope-corpus-manifest-build-summary.v1.json](../../evaluation/envelope-corpus-manifest-build-summary.v1.json) |
| Gap report (133 included, 0 excluded) | [envelope-gap-report.v1.yaml](../../evaluation/envelope-gap-report.v1.yaml) — `validation_errors: []` |
| Operator README | [evaluation/README.md](../../evaluation/README.md) |
| Batch token/schema | `envelope-corpus-manifest.v1` + PLAN/DOC tokens (incl. dotted plan ids) in [batch-collect.ts](../../../../mcp-server/src/request-evidence-envelope/batch-collect.ts) |

**Coverage:** 133 working folders with on-disk envelopes; 118 folders without `request-evidence-envelope.v1.json` (no batch row — advisory backlog).

---

## Not done

- Publish manifest gap string may remain until EDPC republish (process gap is **visibility**, not blocking).
- Per-folder envelope quality remediation (gap codes inside each row) — out of scope for G5 manifest pass.
- Traceable commit: `2fa173cc` — [traceable-commit-evidence.md](./traceable-commit-evidence.md)

---

## Refresh

See [evaluation/README.md](../../evaluation/README.md).
