# Test strategy — plan-close-out replay ([REQ-TIED_BOUNDED_COMPOSITION])

**Wave:** plan-close-out refine pass 2 (2026-10-18)  
**Authority:** Full module matrix remains in [test-strategy.md](./test-strategy.md). This file is **replay-only** for close-out.

## Preconditions

- Project TIED indexes materialized (REQ/ARCH/six IMPL + semantic tokens) from [evidence/mint-*.json](./evidence/).
- Canonical slug evidence files present under [evidence/](./evidence/) before unified gate replay.

## Replay commands (must pass)

```bash
cd /Users/fareed/Documents/dev/chatgpt/stdd/mcp-server && npm run build
node --import tsx --test src/bounded-composition/*.test.ts
```

Expected: **45/45** (baseline [bounded-composition-test-slice5.txt](./evidence/bounded-composition-test-slice5.txt)).

```bash
cd /Users/fareed/Documents/dev/chatgpt/stdd/mcp-server && npx tsc -b
```

```bash
export TIED_BASE_PATH="/Users/fareed/Documents/dev/chatgpt/stdd/tied-project"
/Users/fareed/Documents/dev/chatgpt/stdd/.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency
```

After indexes exist:

```bash
export TIED_BASE_PATH="/Users/fareed/Documents/dev/chatgpt/stdd/tied-project"
# tied_verify with update — expect REQ Implemented when test mapping links
```

## Close-out gate replay

```bash
node tools/bootstrap/templates/run-close-out-gates.mjs \
  --project-root /Users/fareed/Documents/dev/chatgpt/stdd \
  --request-token REQ-TIED_BOUNDED_COMPOSITION \
  --tracker-path tied-project/working/REQ-TIED_BOUNDED_COMPOSITION/checklist-tracker.yaml \
  --citdp-path tied-project/working/REQ-TIED_BOUNDED_COMPOSITION/CITDP-REQ-TIED_BOUNDED_COMPOSITION.yaml \
  --phase close_out \
  --run-id bc-plan-close-out-20261018 \
  --envelope-blocking --sync-dispositions --reconcile
```

Save receipt: [evidence/closeout-run-close-out-gates-plan-close-out.json](./evidence/closeout-run-close-out-gates-plan-close-out.json).

**Phase A success:** reconcile **band A**; envelope `blocking_gap_count=0`; `close_out` gate may still cite `traceable-commit` until Phase B.

## Post-commit replay (Phase B)

Re-run same runner with `--run-id bc-closeout-post-commit-20261018` after `traceable-commit` slug completed and BC wave committed.

## Non-goals (close-out wave)

- New RED tests or product behavior changes
- E2E UI
- Methodology-learning experiment upsert (optional advisory)
