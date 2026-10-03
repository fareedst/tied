# Stressor catalog (W1 workshop)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS` · **Count:** 25 (within 20–30 pilot target)

**Scope filter (sponsor):** Technical + operational human only — **no** commercial/vendor/contract stressors.

## Categories used

- `technical` — infrastructure, queue, store, concurrency, deployment skew
- `human` — operator, support, on-call actions and misinterpretation
- `organizational` — handoff/process (operational human factor)

## Catalog

| ID | Category | Stressor (short) | Primary REQ lean | Worksheet |
|----|----------|------------------|------------------|-----------|
| S-T01 | technical | Duplicate delivery (task or create key) | Both | `worksheets/S-T01.md` |
| S-T02 | technical | Worker crash mid-write | Recovery | `worksheets/S-T02.md` |
| S-T03 | technical | Store unavailable on append/publish | Both | `worksheets/S-T03.md` |
| S-T04 | technical | Client timeout after side effect | Both | `worksheets/S-T04.md` |
| S-T05 | technical | Message reorder vs dependency order | Recovery | `worksheets/S-T05.md` |
| S-T06 | technical | Stale resume (revision mismatch) | Recovery | `worksheets/S-T06.md` |
| S-T07 | technical | Concurrent identical create | Idempotent | `worksheets/S-T07.md` |
| S-T08 | technical | Partial manifest publish failure | Idempotent | `worksheets/S-T08.md` |
| S-T09 | technical | API/worker schema or normalization skew | Both | `worksheets/S-T09.md` |
| S-T10 | technical | Lock coordinator unavailable | Idempotent | `worksheets/S-T10.md` |
| S-T11 | technical | 100× retry storm | Both | `worksheets/S-T11.md` |
| S-T12 | technical | Duplicate evidence ordering key (logic bug) | Recovery | `worksheets/S-T12.md` |
| S-T13 | technical | Split claim (two workers, one task_id) | Recovery | `worksheets/S-T13.md` |
| S-T14 | technical | Poison message (deterministic repeat failure) | Recovery | `worksheets/S-T14.md` |
| S-T15 | technical | Disk full on evidence append | Recovery | `worksheets/S-T15.md` |
| S-T16 | technical | Partition: API isolated from store | Recovery | `worksheets/S-T16.md` |
| S-T17 | technical | Empty request_key | Idempotent | `worksheets/S-T17.md` |
| S-T18 | technical | Zombie request-key lock after worker kill | Idempotent | `worksheets/S-T18.md` |
| S-O01 | human | Operator cancel with scheduled dependents | Recovery | `worksheets/S-O01.md` |
| S-O02 | human | On-call policy override unlock | Recovery | `worksheets/S-O02.md` |
| S-O03 | human | Support-only manual recovery path | Recovery | `worksheets/S-O03.md` |
| S-O04 | human | Outdated runbook stale retry | Recovery | `worksheets/S-O04.md` |
| S-O05 | human | Support misreads collision error | Idempotent | `worksheets/S-O05.md` |
| S-O06 | human | On-call bulk cancel without dep check | Recovery | `worksheets/S-O06.md` |
| S-O07 | organizational | On-call handoff without lock context | Idempotent | `worksheets/S-O07.md` |

## Optional machine records

High-value stressors with `records/*.yaml` (candidate `stressor-residue.v1`):

- `records/S-T01.yaml`, `records/S-T07.yaml`, `records/S-T08.yaml`, `records/S-O02.yaml`

## Exit handoff

- **W1 exit:** baseline, catalog, worksheets, incidence matrix, gap list, limitations — complete (see `../evidence/w1-exit-w2-handoff.md`).
- **W2 entry:** `classification-ledger.md` — refine-plan W2 scaffold present; row population deferred to build-plan W2 (`w2-build-plan-classification`).
