## git log -1

3b01a3be394605b9a8798c35a9025244557501ac 2026-11-07 04:03:55 -0800 feat(csv): map CSV rows to objects

## npm test

> test
> node --import tsx --test 'src/**/*.test.ts'

✔ returns no objects for empty input
✔ returns no objects for a header-only CSV
✔ maps one data row using header keys and string values
✔ preserves quoted commas, escaped quotes, and empty fields
✔ rejects rows with a different number of fields
✔ rejects unterminated quoted fields
ℹ tests 6 — pass 6 — fail 0

## npm run typecheck

> typecheck
> tsc --noEmit

(pass)

Full JSON: [tied_validate_consistency.json](./tied_validate_consistency.json) (`"ok": true`).
