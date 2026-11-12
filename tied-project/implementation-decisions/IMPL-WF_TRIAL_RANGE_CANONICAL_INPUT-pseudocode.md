# IMPL essence — [IMPL-WF_TRIAL_RANGE_CANONICAL_INPUT]

<!-- [REQ-WF_TRIAL_RANGE_CANONICAL_INPUT] [ARCH-WF_TRIAL_RANGE_CANONICAL_INPUT] [IMPL-WF_TRIAL_RANGE_CANONICAL_INPUT] -->

```text
DERIVE_DISPOSABLE_MODEL_BUCKET(model_config, model_effort, resolution)
  // [REQ-WF_TRIAL_RANGE_CANONICAL_INPUT] [ARCH-WF_TRIAL_RANGE_CANONICAL_INPUT] — single tier in dirname
  PRE: model_config non-empty string
  POST: lowercase alphanumeric bucket without redundant effort token
  normalized := strip_dots_hyphens(model_config)
  IF tier_already_in_config(model_config) THEN
    RETURN normalized
  ENDIF
  IF model_effort set AND composer25_exception(model_config) THEN
    RETURN normalized + strip_dots_hyphens(model_effort)
  ENDIF
  RETURN normalized
END

RESOLVE_REF_WITH_BUCKET(harness, model_ref, effort)
  // extends resolveWfTrialModelRef; compose dotted keys e.g. grok-4.7
  result := existing_compose_matrix_catalog_chain(...)
  result.disposable_model_bucket := DERIVE_DISPOSABLE_MODEL_BUCKET(...)
  RETURN result
END

BUILD_DISPOSABLE_TAG(wf_id, harness, disposable_model_bucket)
  // [IMPL-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG] consumer — prefer bucket over MODEL_CONFIG concat
  PRE: disposable_model_bucket exported when resolve-ref succeeds
  POST: tag wf-agentstream-{wf}-{harness}-{bucket}
END
```
