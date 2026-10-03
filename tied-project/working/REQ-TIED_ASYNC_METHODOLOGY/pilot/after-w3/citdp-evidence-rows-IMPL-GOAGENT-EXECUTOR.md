# Pilot after-w3 — CITDP evidence rows for IMPL-GOAGENT-EXECUTOR

Reference pilot block: `executor_Run` from `pilot/after-t0/IMPL-GOAGENT-EXECUTOR-with-async-rows.md`.

W3 candidate triggers (from `deriveAsyncCitdpTriggers`):

| Trigger | Profile / action | Recorded disposition |
|---------|------------------|----------------------|
| async-boundary-catalog | integrated (behavior change) | Phase B catalog table — see `pilot/after-w2/catalog-table-IMPL-GOAGENT-EXECUTOR.md` |
| timeout-cancellation-evidence | slow-provider + cancellation outcome | TIMEOUT + CANCELLATION rows in IMPL contract |
| retry-idempotency-evidence | duplicate-delivery idempotency | MESSAGE_CONTRACT at-least-once with handler dedup |

## Evidence matrix rows (selected)

| Attribute | Artifact | Proof boundary | Minimum acceptance | Pilot status |
|-----------|----------|----------------|-------------------|--------------|
| async-await-sequencing | SEQUENCING + CONTROL: ordering | Documented local ordering | Success/failure continuation named | SEQUENCING: spawn before parse before wait |
| async-cancellation | CANCELLATION + unit test | Named cancellation POST | Caller, point, DATA outcome named | CANCELLATION: caller via ctx → CANCELLED; POST discard partial |
| async-termination | TERMINATION + close test | Declared completion/open wait | Close condition or may_diverge | TERMINATION: total on process exit |

## Selected inquiry cases (documented, not run in W3 build)

- ASYNC-001: REQ timeout vs IMPL TIMEOUT row alignment
- ASYNC-005: Cancellation POST names DATA outcome after cancel
- ASYNC-006: Open wait bounded by process exit (TERMINATION: total)

**Activation contract:** `async_in_scope` alone does not authorize `tied_adversarial_inquiry_run`. Owner: stdd methodology sponsor. Expiry: 2026-12-31. Gate policy: advisory.
