# Examples — publish-wf-trial-summaries

## Full refresh (default)

```text
@publish-wf-trial-summaries
```

```bash
node tools/bootstrap/lib/wf-trial-summaries-publish.mjs
```

## CI matrix spot check

```bash
node tools/bootstrap/lib/wf-trial-summaries-publish.mjs --check
node tools/bootstrap/lib/build-wf-trial-comparison-matrix.mjs --check
```

## Offline discover parent

```bash
node tools/bootstrap/lib/wf-trial-summaries-publish.mjs --skip-size-batch
```
