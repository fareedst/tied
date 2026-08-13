# Plan and implement — non-TIED

## Plan (when the request is refined) — non-tied-plan

## Plan (when the request is refined)

1. Design tests and security mitigations. If behavior changes, write RED (failing) tests that lock the **desired** behavior--not silent preservation of the old behavior unless that is the explicit goal.

**Gate:** Do not start code until IMPL pseudo-code (with block token comments) and test strategy are in place.

## Plan (when the request is refined) — non-tied-debug

## Plan (when the request is refined)

1. Design tests and security mitigations. If behavior changes, write RED (failing) tests that lock the **desired** behavior--not silent preservation of the old behavior unless that is the explicit goal.

**Gate:** Do not start code until test strategy are in place.

## Implement (when design is composed) — simple

## Implement (when design is composed)

1. RECORD vocabulary.
2. RED tests before code (TDD).
3. RECORD vocabulary after tests/code.

**Note:** In `non-tied-*` workflows, skip TIED synchronization steps. Do **not** RECORD vocabulary into `tied/vocab/` or mutate TIED artifacts — see [non-tied-boundary.md](non-tied-boundary.md).
