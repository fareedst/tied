## git log -1
92e6678d788a895fbd088677e011ce73bd374299 2026-11-07 03:14:23 -0800 docs(req): link close-out handoff to traceable commit SHA

## npm test

> test
> node --import tsx --test 'src/**/*.test.ts'

▶ parseCsvToRows
  ✔ returns empty array for header-only input (T1) (0.859708ms)
  ✔ maps one data row to string-valued object (T2) (0.10475ms)
  ✔ keeps numeric-looking cell text as string (T3) (0.051833ms)
  ✔ parses quoted field containing a comma (T4) (0.045333ms)
  ✔ throws for empty input (T5) (0.132208ms)
  ✔ pads short rows and ignores extra trailing cells (T6) (0.0475ms)
✔ parseCsvToRows (1.767792ms)
ℹ tests 6
ℹ suites 1
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 95.287917

## npm run typecheck

> typecheck
> tsc --noEmit

Full JSON: [tied_validate_consistency.json](./tied_validate_consistency.json) (`"ok": true`).
