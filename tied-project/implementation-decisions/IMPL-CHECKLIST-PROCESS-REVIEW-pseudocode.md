# IMPL-CHECKLIST-PROCESS-REVIEW — essence pseudocode

<!-- [IMPL-CHECKLIST-PROCESS-REVIEW] [ARCH-CHECKLIST-PROCESS-REVIEW] [REQ-CHECKLIST-PROCESS-REVIEW] — deliver phase-1 operator docs only; no runtime or canonical checklist mutation. -->

## PUBLISH_REVIEW_OPERATOR_DOCS

```
# [IMPL-CHECKLIST-PROCESS-REVIEW] [ARCH-CHECKLIST-PROCESS-REVIEW] [REQ-CHECKLIST-PROCESS-REVIEW]
INPUT: linked_plan_content, satisfaction_criteria SC-CPR-*
OUTPUT: docs/checklist-process-review-plan.md, docs/checklist-process-review-checklist.md
PRE: build-plan phase 1 authorized; depth_tier minimal
POST: both files exist; non-replacement disclaimer present
EFFECTS: none on tied-bundle checklist YAML
FAILURE_MODES: missing section → halt before verification gate
```

### AUTHOR_PLAN_DOC

<!-- [IMPL-CHECKLIST-PROCESS-REVIEW] [ARCH-CHECKLIST-PROCESS-REVIEW] [REQ-CHECKLIST-PROCESS-REVIEW] — materialize generic procedure from linked plan. -->

```
DATA: scope_roots, authority_rules, review_passes, deletion_gates, validation_commands, drift_patterns
CONTROL: write docs/checklist-process-review-plan.md with all SC-CPR-PLAN sections
```

### AUTHOR_CHECKLIST_DOC

<!-- [IMPL-CHECKLIST-PROCESS-REVIEW] [REQ-CHECKLIST-PROCESS-REVIEW] — worksheet sections A–J with sign-off fields. -->

```
DATA: checklist_outline A..J from linked plan
CONTROL: write docs/checklist-process-review-checklist.md
```

### VERIFY_DOC_ONLY_CLOSEOUT

<!-- [REQ-CHECKLIST-PROCESS-REVIEW] — manual satisfaction review; tied_validate_consistency after TIED writes. -->

```
CONTROL: manual review against SC-CPR-*; run tied_validate_consistency
TERMINATION: verification gate allowed at minimal depth
```
