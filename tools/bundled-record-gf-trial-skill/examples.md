# record-gf-trial — examples

## Numeric client id

```text
@record-gf-trial 1792857852
```

Expect: resolve via `TIED_GF_TRIAL_CLIENTS_ROOT`; discover **PROMPT-GF-04** from client PLAN; if [trial-readout-PROMPT-GF-04-1792857852.md](../../docs/demos/trial-readout-PROMPT-GF-04-1792857852.md) exists, **stop** unless `--force`.

## Absolute path

```text
@record-gf-trial /Users/me/dev/test/1792861936 --custom
```

Expect: custom greenfield readout naming (`CUSTOM-AUDIT-BRIEF` slug pattern), **TIED-DEMO-23** lens when documented in client PLAN.

## Readout only (no feedback upstream)

```text
@record-gf-trial /Users/me/dev/test/1791731617 --skip-feedback-ingest
```

Expect: trial readout + catalog row; client may still have local `feedback.yaml` — skill does not copy to store without ingest step.

## Republish after fix

```text
@record-gf-trial 1792857852 --force
```

Expect: sponsor explicitly accepts overwriting or revising existing readout and catalog links.
