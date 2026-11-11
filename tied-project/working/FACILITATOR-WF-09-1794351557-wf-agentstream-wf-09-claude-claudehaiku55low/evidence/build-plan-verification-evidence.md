# Facilitator verification — PROMPT-WF-09 / 1794351557-wf-agentstream-wf-09-claude-claudehaiku55low

## HEAD pin

```
96557736ce46245088b02a6cd039aa56d00a3211 TIED 4.2.1
```

## npm test

```
 later items finish first (42.336375ms)
✔ observed in-flight count never exceeds the concurrency bound (32.656833ms)
✔ default concurrency runs all items in flight at once (11.448542ms)
✔ empty input resolves to [] and never calls fn (0.159084ms)
✔ rejects with the first failure and starts no further items (17.613041ms)
✔ invalid concurrency rejects with RangeError (0.202666ms)
✔ a synchronous throw in fn rejects the result promise (0.082708ms)
✔ concurrency greater than items.length behaves like the default (11.381458ms)
✔ a late rejection after the first failure is not an unhandled rejection (87.149666ms)
✔ items start in ascending input index order under bounded concurrency (37.294917ms)
ℹ tests 10
ℹ suites 0
ℹ pass 10
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 349.507166
```

## tied_validate_consistency

Full JSON: [tied_validate_consistency.json](./tied_validate_consistency.json) (`"ok": true`).
