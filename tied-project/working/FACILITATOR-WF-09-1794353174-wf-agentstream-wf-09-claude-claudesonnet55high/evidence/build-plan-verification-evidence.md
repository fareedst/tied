# Facilitator verification — PROMPT-WF-09 / 1794353174-wf-agentstream-wf-09-claude-claudesonnet55high

## HEAD pin

```
6204a181fc1a5ddeab25375a224a974bd0a47a88 feat(concurrency): add order-preserving mapConcurrent
```

## npm test

```
tion
  ✔ T12 rejects invalid concurrency with RangeError (0.223333ms)
  ✔ T13 rejects a non-function mapper with TypeError (0.101375ms)
  ✔ T19 rejects non-iterable input with TypeError (0.060167ms)
  ✔ T22 applies mapper, items, concurrency, signal checks in that order (0.08175ms)
✔ argument validation (0.537917ms)
▶ abort signal
  ✔ T14 rejects with signal.reason and calls no mapper when already aborted (0.108208ms)
  ✔ T15 stops launching and rejects with signal.reason when aborted mid-run (2.703375ms)
  ✔ T18 settled variant also rejects with signal.reason on abort (2.487209ms)
  ✔ T17 leaves no abort listener after completion, fail-fast, or abort (1.843834ms)
✔ abort signal (7.25325ms)
ℹ tests 26
ℹ suites 5
ℹ pass 26
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 134.040708
```

## tied_validate_consistency

Full JSON: [tied_validate_consistency.json](./tied_validate_consistency.json) (`"ok": true`).
