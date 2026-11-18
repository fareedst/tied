# Session handoff — REQ-TIED_EXTERNAL_SERVICE_COMPARISON

**handoff_kind:** session  
**Date:** 2026-11-17  
**prompt_type:** @refine-plan  
**work_item:** stub-capture-policy

---

## Plan spine

| Item | Path / note |
| --- | --- |
| Linked PLAN | [PLAN-stub-capture-policy.md](../PLAN-stub-capture-policy.md) |
| Program phase | pre-implementation; kaizen on implemented REQ |
| Parent delivery | [PLAN.md](../PLAN.md) (close_out_complete) |

---

## Authoritative refs

| Ref | Path |
| --- | --- |
| Tracker | [checklist-tracker-stub-capture-policy.yaml](../checklist-tracker-stub-capture-policy.yaml) |
| CITDP | [CITDP-REQ-TIED_EXTERNAL_SERVICE_COMPARISON-stub-policy.yaml](../../../citdp/CITDP-REQ-TIED_EXTERNAL_SERVICE_COMPARISON-stub-policy.yaml) |
| Retrofit inventory | [retrofit-inventory.md](retrofit-inventory.md) |
| Test strategy | [test-strategy-stub-capture-policy.md](../test-strategy-stub-capture-policy.md) |

---

## Plan execution steps

**Last updated:** 2026-11-17 · **prompt_type:** @refine-plan · **PLAN:** [PLAN-stub-capture-policy.md](../PLAN-stub-capture-policy.md)

### Required

- [x] `leap-spec` — Add `SC-ESC-NO-SOURCE-COPY`, ARCH stub boundary, IMPL `STUB_CAPTURE_POLICY`; `pseudocode_validate`
- [x] `red-skill-contract` — Extend `external-service-comparison-skill.test.mjs` (stub / no-copy Waves 1–3)
- [x] `red-capture-inventory` — Add `comparison-capture-stub-policy.test.mjs` with exempt list from retrofit-inventory
- [x] `green-skill-template` — SKILL.md, reference.md, examples.md, three-wave template
- [x] `retrofit-batch-a` — LangChain harness, Traefik, Netflix, Cursor, Google skills, Anthropic appendix stubs
- [x] `retrofit-batch-b` — Onono cluster, Persante, LangWatch, Alibaba, Open Specter (NVIDIA repo summary exempt)
- [x] `verify-close` — Bootstrap tests green; `pseudocode_validate` ok; CHANGELOG line

### Optional

- [ ] `client-index-blurb` — One sentence in client-development-index / prompt-composer on no-source-copy
- [ ] `wave2-paste-trim` — Grep Wave 2 analyses for long vendor paste blocks

### Recommendations

- Land **Batch A** retrofit in same commit as skill GREEN so static inventory test passes atomically.
- Keep **software-engineering-degree** and **jev taxonomy** on exempt list permanently.
- Defer single mega-commit for entire `docs/comparisons/` tree.

### Changelog (this REQ)

- 2026-11-17 @refine-plan: Stub capture policy PLAN, CITDP addendum, tracker, retrofit inventory, test strategy, session handoff.
- 2026-11-17 @build-plan: Skill/template/tests GREEN; article capture retrofit; LEAP REQ/ARCH/IMPL; close-out deferred.
- 2026-11-17 @close-out: Gate allowed; commit `58f94114`; envelope 0 blocking gaps.

---

## Environment

| Field | Value |
| --- | --- |
| workspace_root | `/Users/fareed/Documents/dev/chatgpt/stdd` |
| TIED_BASE_PATH | `/Users/fareed/Documents/dev/chatgpt/stdd/tied-project` |
| plan_phase | close_out_complete |

---

## Requirements and dependencies

| Token / item | Role |
| --- | --- |
| REQ-TIED_EXTERNAL_SERVICE_COMPARISON | Parent REQ (amend via LEAP) |
| depth_tier | minimal |
| gate_policy | advisory |

**Do next:** none for stub-capture-policy (complete). Optional: allowlist more `docs/comparisons/onono-*.md` if stubs should ship in git.