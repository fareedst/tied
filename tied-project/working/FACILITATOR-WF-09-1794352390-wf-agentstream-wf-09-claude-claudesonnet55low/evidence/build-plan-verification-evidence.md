# Facilitator verification — PROMPT-WF-09 / 1794352390-wf-agentstream-wf-09-claude-claudesonnet55low

## HEAD pin

```
0063db8124a072a9b676785fd6acf23b90c86f03 TIED 4.2.1
```

## npm test

```
✔ invalid concurrency rejects with RangeError (0.464083ms)
✔ already aborted signal rejects with reason without calling fn (0.080583ms)
✔ results keep input order though completion order differs (31.299083ms)
✔ concurrency cap bounds in-flight calls (33.413458ms)
✔ empty input resolves to [] (0.150666ms)
✔ sync fn and index argument (0.068375ms)
✔ fail-fast rejects and starts no new items (37.253458ms)
✔ sync throw is a rejection (0.211416ms)
✔ mid-run abort rejects with reason and stops new starts (56.12375ms)
ℹ tests 9
ℹ suites 0
ℹ pass 9
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 264.884292
```

## tied_validate_consistency

Full JSON: [tied_validate_consistency.json](./tied_validate_consistency.json) (`"ok": true`).
