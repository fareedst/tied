# Client envelope validate — read-only (Reddit doc gate)

**Date:** 2026-09-25  
**Process:** `PROCESS-REDDIT-CLIENT-1790356640`  
**Client root:** `/Users/fareed/Documents/dev/test/1790356640`  
**Envelope:** `working/REQ-USER_PROCESS_LIST/evidence/request-evidence-envelope.v1.json`

## Command

MCP `request_evidence_envelope_validate` with:

- `project_root`: client root above
- `envelope_path`: path above (relative to client root)
- `fail_on_error_gaps`: false (capture mode)
- `fail_on_process_gaps`: false

## Result (initial read-only pass)

| Field | Value |
| --- | --- |
| `ok` | true |
| `blocking_gap_count` | 0 |
| `advisory_gap_count` | 1 |

### Advisory gap (initial)

| Code | Severity | Summary |
| --- | --- | --- |
| `evidence_stale` | warn | Envelope `tracker_hash` (byte hash) differed from gate receipt semantic hash (`gate-hash-drift`) |

**No client tree mutations** on the initial pass.

## Result (after envelope refresh — 2026-09-25 follow-up)

| Field | Value |
| --- | --- |
| `ok` | true |
| `blocking_gap_count` | 0 |
| `advisory_gap_count` | **0** |

Actions: re-persisted gate receipts for current tracker, backfilled `working/REQ-USER_PROCESS_LIST/evidence/request-evidence-envelope.v1.json`, aligned envelope `cross_links.tracker_hash` with gate receipt `input_hashes.tracker_hash` (semantic hash). See [`dae-cli-demo-2026-09-25.md`](dae-cli-demo-2026-09-25.md).

**Close-out blocking replay:** With `fail_on_error_gaps: true`, validate reports `ok: true` and `blocking_gap_count: 0`.
