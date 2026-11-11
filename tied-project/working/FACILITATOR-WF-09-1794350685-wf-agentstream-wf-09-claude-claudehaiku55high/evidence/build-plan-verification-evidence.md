# Facilitator verification — PROMPT-WF-09 / 1794350685-wf-agentstream-wf-09-claude-claudehaiku55high

## HEAD pin

```
1f311d902ab20e60bcb3f1c7525fb3f7ae616773 feat(concurrency): add ordered concurrent map
```

## npm test

```
 any mapper call (0.029ms)
  ✔ VALIDATE_ARGUMENTS: concurrency string 2 rejects with RangeError before any mapper call (0.020792ms)
  ✔ VALIDATE_ARGUMENTS: options object without concurrency rejects with RangeError (0.024333ms)
  ✔ VALIDATE_ARGUMENTS: non-array items reject with TypeError before any mapper call (0.042667ms)
  ✔ VALIDATE_ARGUMENTS: non-function mapper rejects with TypeError (0.034083ms)
  ✔ VALIDATE_ARGUMENTS: null or non-object options reject with TypeError (0.035958ms)
  ✔ VALIDATE_ARGUMENTS: items are checked before mapper and options (0.023709ms)
  ✔ VALIDATE_ARGUMENTS: invalid concurrency is rejected even when items are empty (0.017291ms)
✔ VALIDATE_ARGUMENTS (0.6125ms)
ℹ tests 20
ℹ suites 3
ℹ pass 20
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 243.092084
```

## tied_validate_consistency

Full JSON: [tied_validate_consistency.json](./tied_validate_consistency.json) (`"ok": true`).
