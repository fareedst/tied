# Facilitator verification — PROMPT-WF-09 / 1794352615-wf-agentstream-wf-09-claude-claudesonnet55medium

## HEAD pin

```
fbfaedaca882f1c52ea968b9b1e7aacebc5a86af feat(ordered-map): ordered concurrent async map
```

## npm test

```
served when completion order differs (31.7985ms)
✔ AC2 concurrency cap respected and reached (35.735084ms)
✔ AC3 concurrency 1 is serial (33.238584ms)
✔ AC4 fail-fast rejects with first error and starts no more (31.680833ms)
✔ AC5 settled output is input-ordered (15.26825ms)
✔ AC6 pre-aborted signal rejects without calling mapper (0.149833ms)
✔ AC6 mid-run abort rejects with reason and starts no more (56.216667ms)
✔ AC7 invalid concurrency rejects with RangeError (0.230833ms)
✔ AC7 empty input returns [] without calling mapper (0.075375ms)
✔ AC8 mapper receives item, index, signal; sync values; input not mutated (0.103083ms)
✔ sync-throwing mapper is a rejection; iterables accepted (0.07425ms)
ℹ tests 11
ℹ suites 0
ℹ pass 11
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 309.363
```

## tied_validate_consistency

Full JSON: [tied_validate_consistency.json](./tied_validate_consistency.json) (`"ok": true`).
