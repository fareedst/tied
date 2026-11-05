# Facilitator verification evidence

## HEAD

See [head.txt](./head.txt) (`git log -1 --format=%H` @ client root).

## npm test

```
ℹ tests 14
ℹ pass 14
ℹ fail 0
```

Full stdout: [npm-test.stdout.txt](./npm-test.stdout.txt) (facilitator re-run 2026-11-04).

## npm run typecheck

Pass — [npm-typecheck.stdout.txt](./npm-typecheck.stdout.txt).

## tied_validate_consistency

Full JSON: [tied_validate_consistency.json](./tied_validate_consistency.json) (`"ok": true`).

**Facilitator note:** REQ index and detail both **Proposed** — `tied_verify` not run at close-out.
