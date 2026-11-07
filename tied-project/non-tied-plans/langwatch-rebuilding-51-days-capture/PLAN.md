# Plan: LangWatch “Rebuilding LangWatch in 51 days” (Wave 1, local-only)

**Slug:** `langwatch-rebuilding-51-days-capture`  
**Track:** Cursor plan → `@non-tied-refine` (this plan) → `@non-tied-build` → optional `@non-tied-close`  
**Source:** [Refactoring at AI speed, without the AI slop](https://langwatch.ai/blog/rebuilding-langwatch-in-51-days) (LangWatch blog, Alex Forbes-Reed, published 13 October 2026; refactor window 23 Aug–12 Oct 2026)  
**Template (Wave 1):** [`tied-bundle/docs/external-service-three-wave-comparison-template.md`](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) — capture sections  
**Evaluation charter (proof only):** [`docs/tied-methodology-evaluation-framework.md`](../../../docs/tied-methodology-evaluation-framework.md) — Q5 cost pairing, Q1 arms separation, **not** comparable-arms metrics from this capture alone  
**Wave 2 slug (sibling):** [`langwatch-rebuilding-51-days-vs-tied`](../langwatch-rebuilding-51-days-vs-tied/PLAN.md)

## Scope

Doc-only **Wave 1 capture**: normalized, offline-readable summary of LangWatch’s post-mortem on a **51-day** modular refactor driven by one engineer and many coding agents—module architecture, machine-checked rules, trace-driven coordination, merge-from-main harness, and verification (simulators, apidiff/visualdiff, agent UI test drive). **No** Wave 2 matrix in this file, **no** project REQ/ARCH/IMPL YAML, **no** `.gitignore` allowlist unless sponsor opts in.

| Boundary | Choice |
| --- | --- |
| Deliverable | `docs/comparisons/langwatch-rebuilding-langwatch-in-51-days.md` |
| Publish | **Local only** — parent rule `docs/comparisons/*` |
| Evidence tool | **agent-browser** (primary); text-only mode + TOC jumps for 15 sections |
| Body style | **Structured capture** (template normalization): metadata, TL;DR, section-aligned prose — **no** site chrome; truncate repetitive figure alt-text to one-line captions where needed |
| Claims | **LangWatch-reported**; stdd effectiveness **`not_measured`** |

## Refine outcomes (Touchpoint 1 — RESOLVE)

| Term | Meaning (this slug) |
| --- | --- |
| **Wave 1** | Link + labeled capture for Wave 2 routing; no token mint |
| **Module** | LangWatch feature package: contract / process / browser / client; upward calls + event stream |
| **Architecture record** | ~3k-line ADR-style layout doc; code wrong when it disagrees with record |
| **Lane agent** | Coordinator assigning bounded file sets, models, and “done” criteria |
| **Owed-ports list** | Named backlog of main-line changes not yet carried to refactor branch |
| **Gitignored capture** | Sponsor intent: keep under `docs/comparisons/` without allowlist |

**Gate:** Ambiguity cleared — Wave 1 only in this slug; local-only; browser-primary; Wave 2 is separate build pass per sibling PLAN.

## Evidence inputs (read-only)

| Role | Source |
| --- | --- |
| Primary | Blog URL above (15-act TOC via agent-browser) |
| Secondary (in-article links — summarize only) | Rule-definition page, lint-rule skill, lane agent write-up, Jev comparison, “track Claude Code usage” — capture URLs + 3–8 bullet takeaways each; **do not** mirror entire external sites |
| Cross-check | Re-snapshot if lazy-load truncates Acts I–III |
| Local context (no paste) | [`docs/tied-methodology-evaluation-framework.md`](../../../docs/tied-methodology-evaluation-framework.md) § Evaluation questions — cite in Notes only |

## Deliverable outline (`@non-tied-build`)

1. **Metadata table** — Source, author, published 2026-10-13, captured date, purpose, proof boundary, sibling Wave 2 filename, related captures (LangChain harness, Cursor harness, Traefik seam, conversation-analysis-tools).
2. **TL;DR** — 10–14 bullets, all **LangWatch-reported** (51 days, 9,187 branch commits, 30 main merges, 66 modules, 76 lint rules, ~$96k / 555 sessions, 989/1016 test-drive flows, production misses, etc.).
3. **Section-aligned summary** (Acts I–III / sections 01–15), condensed non-verbatim:
   - Act I: parallel branch, why monolith failed agents, module/event plan, eight overlapping phases timeline.
   - Module anatomy: contract–process–browser–client; route declaration stack (credential, permission, audit, input schema).
   - Move phase: empty old app by 3 Sep; rewrite ratio; boot failures when checks thin.
   - Main merge hazard: conflict count vs silent loss; owed-ports list from 21 Sep.
   - Act II: dogfood traces (11 Sep), context cost (493:1 re-read), workflow rules (briefs, handovers, model tiering, shared verify queue).
   - Rules: 76 lint errors, architecture enforcer, three-part lint messages, 60+ skills, ~70 engineer decisions/day.
   - Lint debt / circular dependencies to zero; lane coordinator peaks.
   - Act III: haven stacks, 12 simulators, shared Playwright; apidiff/visualdiff; 3-day Haiku test drive; typecheck speed; upgrade trials; lessons learned + production catches.
4. **Notes for stdd readers** — Not `tied_validate_consistency`; not evidence-chain profile scores; evaluation framework Q5 pairs cost narratives only with explicit denominators; link Wave 2 sibling when built.

## Plan package paths

| Artifact | Path |
| --- | --- |
| Capture | `docs/comparisons/langwatch-rebuilding-langwatch-in-51-days.md` |
| Plan folder | `tied-project/non-tied-plans/langwatch-rebuilding-51-days-capture/PLAN.md`, `test-strategy.md`, `evidence/session-handoff.md` |

## Forbidden

Minting REQ/ARCH/IMPL from capture prose; MCP project YAML writes; `.gitignore` allowlist without sponsor opt-in; treating LangWatch lint/ADR stack as TIED YAML truth; claiming methodology superiority; Wave 2 matrix in Wave 1 file.

## Verification

See [test-strategy.md](test-strategy.md). Handoff: [evidence/session-handoff.md](evidence/session-handoff.md).
