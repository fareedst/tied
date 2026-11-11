# Facilitator verification — PROMPT-WF-09 / 1794350349-wf-agentstream-wf-09-claude-claudehaiku55medium

## HEAD pin

```
f57a4f6f4ffc7a71fa96080ebccd3fc519454a67 TIED 4.2.1
```

## npm test

```
concurrency is accepted (0.16875ms)
✔ concurrency 0 rejects with RangeError (0.2015ms)
✔ concurrency -1 rejects with RangeError (0.038417ms)
✔ concurrency 1.5 rejects with RangeError (0.029833ms)
✔ concurrency NaN rejects with RangeError (0.036125ms)
✔ invalid concurrency rejects even when items is empty (0.065833ms)
✔ synchronous throw from mapper rejects with that error (0.095458ms)
✔ rejected promise from mapper rejects with that error (0.045333ms)
✔ fail-fast: no new items start after a failure (5.060167ms)
✔ reports the first failure in time, not the lowest index (4.744958ms)
✔ mapper receives the original input index (20.984167ms)
✔ no unhandled rejection after fail-fast (55.661208ms)
ℹ tests 16
ℹ suites 0
ℹ pass 16
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 342.950834
```

## tied_validate_consistency

Full JSON: [tied_validate_consistency.json](./tied_validate_consistency.json) (`"ok": true`).
