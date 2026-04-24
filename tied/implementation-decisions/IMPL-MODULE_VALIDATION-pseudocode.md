# [IMPL-MODULE_VALIDATION] [ARCH-MODULE_VALIDATION] [REQ-MODULE_VALIDATION]
# Summary: Five-phase lifecycle — identify module boundaries, build with DI, validate in isolation, document, integrate only when green.

# How: Contract — INPUT/OUTPUT/CONTROL for MODULE_VALIDATION_LIFECYCLE below (same IMPL/ARCH/REQ).
# How: INPUT — module boundary spec; interfaces; mocks and test doubles.
# How: OUTPUT — validation evidence (passing tests, notes); go/no-go for integration.
# How: CONTROL — integration blocked until independent validation passes.

procedure MODULE_VALIDATION_LIFECYCLE:
  # How: Phases 1–5 — document boundaries; implement with DI; unit + contract + edge-case tests; record results; integration tests on combined behavior.
  # How: Gate — blocks integration with other IMPLs until module-local validation passes (ordering: validate before compose).
  # How: Branch — validation or documentation failure; no integration until fixed.
  IF phase 3 or 4 fails: RETURN without integration; fix module or revise boundaries
  # How: Branch — combined behavior contradicts module contracts after integration attempt.
  IF phase 5 fails: RETURN; treat as integration defect against documented contracts