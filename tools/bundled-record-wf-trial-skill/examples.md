# record-wf-trial — examples

## Numeric client id

```text
@record-wf-trial 1793000001
```

Expect: resolve via `TIED_GF_TRIAL_CLIENTS_ROOT`; discover **PROMPT-WF-01** and model headers from client PLAN; if `trial-readout-PROMPT-WF-01-*-1793000001.md` exists, **stop** unless `--force`.

## Absolute path with overrides

```text
@record-wf-trial /Users/me/dev/test/1793000042 --prompt PROMPT-WF-03 --model-config luna-med
```

Expect: workflow readout with composition-seam stress; filename includes `luna-med` slug.

## Readout only (no feedback upstream)

```text
@record-wf-trial /Users/me/dev/test/1793000055 --skip-feedback-ingest
```

Expect: trial readout + workflow catalog row; ingest documented **N/A**.

## Republish after fix

```text
@record-wf-trial 1793000042 --force
```

Expect: sponsor explicitly accepts revising existing readout and catalog links.
