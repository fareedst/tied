# W1 pilot baseline — BBCE change locality (Mechanism A)

**Change ID:** `PLAN-TIED-BBCE-ALIGNMENT` · **Wave:** W1 build-plan (2026-09-27)

**Status:** Pilot metrics only — not canonical REQ/ARCH/IMPL.

## System under measurement

- **Package:** `@tied/agentstream` (`mcp-server/packages/agentstream/`)
- **Binding inventory:** `tied/docs/composition-coverage.md` § Project inventory (STDD / agentstream)
- **Analysis module:** `mcp-server/src/analysis/change-locality-pilot.ts` (optional slice map + declared surface → BBCE-style metrics)

## Pilot question

When a sponsor **declares** an expected change surface before implementation, does the **actual git diff** stay local to the owning behavioral slice (REQ-scoped), and where do shared mechanisms and cross-slice touches appear?

## Naïve measurement loop

```text
slice-map.yaml (binding → owning REQ + path globs)
        │
        ▼
declared-change-surface*.yaml (expected globs + owning slice)
        │
        ▼
git replay (read-only revision range) → changed_paths
        │
        ▼
change_locality = in_declared / total_changed
+ unexpected_paths, shared_mechanism_touches, slice_crossings
        │
        ▼
locality-run.json (+ optional working JSONL append)
```

## Proof boundary

Metrics prove **diff-scope discipline** and declared-surface alignment only. They do **not** prove behavioral correctness, REQ satisfaction, composition sufficiency, or test adequacy.

## REQ anchors (read-only context, not validated in W1)

Pilot slice map references existing project REQ tokens (e.g. `REQ-TIED_CLAUDE_LIVE_DRIVER`, `REQ-GOAGENT-PIPELINE-CHAIN`) as **behavioral slice owners** — not new requirements.
