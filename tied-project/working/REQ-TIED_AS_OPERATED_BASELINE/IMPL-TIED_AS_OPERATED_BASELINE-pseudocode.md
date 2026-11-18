# IMPL essence pseudo-code — [IMPL-TIED_AS_OPERATED_BASELINE]

**Status:** Draft for build-plan · **REQ:** `[REQ-TIED_AS_OPERATED_BASELINE]` · **ARCH:** `[ARCH-TIED_AS_OPERATED_BASELINE]`

---

```text
# [IMPL-TIED_AS_OPERATED_BASELINE] [ARCH-TIED_AS_OPERATED_BASELINE] [REQ-TIED_AS_OPERATED_BASELINE]
# Implements checklist facet as_operated_baseline and RDB snapshot minimum validation at composition-integration and verification-gate.

READ_TRACKER_FACET(tracker)
  # [REQ-TIED_AS_OPERATED_BASELINE] [IMPL-TIED_AS_OPERATED_BASELINE]
  # PRE: tracker is Record
  # POST: returns AsOperatedBaselineFacet | undefined
  # EFFECTS: none
  IF tracker.as_operated_baseline missing THEN RETURN undefined
  RETURN normalizeFacet(tracker.as_operated_baseline)

VALIDATE_AS_OPERATED_BASELINE_FACET(tracker, stepSlug)
  # [REQ-TIED_AS_OPERATED_BASELINE] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [IMPL-TIED_AS_OPERATED_BASELINE]
  # PRE: tracker loaded; stepSlug is checklist slug
  # POST: { ok: boolean, diagnostics: string[] }
  # FAILURE_MODES: invalid_mode → ok false
  facet ← READ_TRACKER_FACET(tracker)
  IF facet is undefined THEN RETURN { ok: true, diagnostics: [] }
  IF facet.mode == "follow_up_only" THEN RETURN { ok: true, diagnostics: [] }
  IF facet.mode != "active" THEN RETURN { ok: false, diagnostics: ["invalid_as_operated_mode"] }

  workingRoot ← resolveWorkingRoot(facet, tracker)
  IF stepSlug == "composition-integration" THEN
    RETURN VALIDATE_SNAPSHOT_A(workingRoot, facet)
  IF stepSlug == "verification-gate" THEN
    RETURN VALIDATE_SNAPSHOT_B(workingRoot, facet)
  RETURN { ok: true, diagnostics: [] }

VALIDATE_SNAPSHOT_A(workingRoot, facet)
  # [REQ-TIED_AS_OPERATED_BASELINE] [ARCH-TIED_AS_OPERATED_BASELINE]
  # PRE: workingRoot directory exists when mode active
  # POST: ok true iff PLAN Snapshot-A minimums + receipt path
  # EFFECTS: read-only filesystem
  counts ← scanRegistryMinimums(workingRoot, tier: "A")
  receipt ← loadReceipt(facet.snapshot_gates, slug: "composition-integration")
  ok ← counts.meetsA AND receipt.valid
  RETURN { ok, diagnostics: merge(counts.diagnostics, receipt.diagnostics) }

VALIDATE_SNAPSHOT_B(workingRoot, facet)
  # [REQ-TIED_AS_OPERATED_BASELINE]
  # PRE: Snapshot-A already satisfied for same engagement (advisory ordering)
  # POST: ok true iff G-0..G-7,G-9 table from parent program
  counts ← scanRegistryMinimums(workingRoot, tier: "B")
  receipt ← loadReceipt(facet.snapshot_gates, slug: "verification-gate")
  ok ← counts.meetsB AND receipt.valid
  RETURN { ok, diagnostics: merge(counts.diagnostics, receipt.diagnostics) }

INTEGRATE_CHECKLIST_VALIDATOR(validateStepContext)
  # [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] [IMPL-TIED_AS_OPERATED_BASELINE]
  # PRE: validateChecklistGate pipeline
  # POST: diagnostics appended; fail closed when active and snapshot missing
  result ← VALIDATE_AS_OPERATED_BASELINE_FACET(tracker, stepSlug)
  IF NOT result.ok THEN blockStepCompletion(result.diagnostics)
  RETURN
```

---

## Contract notes

| Block | TERMINATION |
| --- | --- |
| `VALIDATE_*` | Always returns structured result; never writes `tied-project/*.yaml` |
| `INTEGRATE_CHECKLIST_VALIDATOR` | No authority to advance checklist without shared gate receipt when enforcement profile requires it |