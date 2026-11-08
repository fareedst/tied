# Google Agent Skills × TIED — agent management lens

| Field | Value |
| --- | --- |
| **Purpose** | Map Google’s **ship Agent Skills like products** pipeline (PR gates, semver, eval suites, staged CI, AI review skill) to TIED as implemented in this repository—with emphasis on **harness-adjacent skill quality** vs **platform-adjacent** intent proof; not adopting Google’s internal catalog or eval harness as TIED core. |
| **Audience** | Sponsors, harness authors, prompt-type operators, methodology owners |
| **Source URL** | [Google Cloud Blog](https://cloud.google.com/blog/topics/developers-practitioners/behind-the-scenes-two-months-later-how-we-ship-google-agent-skills-like-products) (2026-10-28) |
| **Article capture (sibling)** | [google-agent-skills-ship-like-products.md](google-agent-skills-ship-like-products.md) — read-only; **reference only** |
| **Status / date** | Outreach / analysis snapshot, **2026-11-07** — **reference only; this document does not mint REQ/ARCH/IMPL tokens** |
| **Record depth** | **`depth_tier: minimal`**, `gate_policy: advisory`, evidence-chain `profile_depth: not_measured` |
| **Executable follow-up** | Wave 3 **Defer** unless sponsor scopes **add-feature** (per-skill semver, mandatory eval on skill PR) |
| **Distinct from** | [Google EGM × TIED](google-egm-elephant-goldfish-vs-tied-agent-management.md) (SDD Elephant/Goldfish); [Persante SDD × TIED](persante-sdd-skills-vs-tied-agent-management.md) (wiki spec skills); [Alibaba OCR × TIED](alibaba-open-code-review-vs-tied-agent-management.md) (diff review bench); [Cursor harness × TIED](cursor-harness-engineering-vs-tied-agent-management.md) (harness telemetry) |
| **TIED anchors (reference only)** | [AGENTS.md](../../AGENTS.md), [tied-methodology-evaluation-framework.md](../tied-methodology-evaluation-framework.md), [agent-req-implementation-checklist.md](../../tied-bundle/docs/agent-req-implementation-checklist.md), [quality-assurance.md](../../tied-project/vocab/quality-assurance.md), [fidelity-research.md](../../tied-project/vocab/fidelity-research.md), [sponsor-agent-relationship.md](../../tied-project/vocab/sponsor-agent-relationship.md) |

---

## Executive summary

Google’s **Agent Skills** program treats each `SKILL.md` change as a **product release**: semver, six deterministic/automated PR gates, **mandatory eval reports** (with/without skill or vs prior version), an **AI reviewer skill**, and human SME sign-off—at **Google-reported** scale (170+ skills, 21k+ stars).

TIED’s center of gravity is **tokenized intent** and **executable proof**: CITDP, REQ→ARCH→IMPL, IMPL **essence_pseudocode**, checklist **pre_implementation** gates, MCP validators, `tied_verify` when verification-gated, LEAP, and evaluation-charter **separate arms** for defect and cost claims. Bundled prompt-type skills already enforce partial **L2** bounds (frontmatter parse, &lt; 500 lines) via e2e tests—not a full Google-style per-skill eval suite on every PR.

**Compose-don’t-replace:** Borrow **staged gates**, **atomic eval expectations**, and **scripts-not-prose** discipline for `tools/bundled-*-skill/` maintenance; keep **gate authority**, **MCP project YAML writes**, and **methodology promotion** on the TIED/checklist/sponsor plane.

| Center of gravity | Google Agent Skills (blog) | TIED (this repo) |
| --- | --- | --- |
| Primary artifact | Versioned **skill packages** in a multi-team catalog | REQ/ARCH/IMPL YAML + tests + checklist receipts |
| Change unit | Skill instruction/script/reference edit | Behavior-changing **REQ** / methodology bundle refresh |
| Quality signal (vendor) | Eval suite pass + AI review + linters | Traceability validators, tests, evidence chain, optional inquiry |
| Versioning | Per-skill **semver** in frontmatter | Methodology **bundle** via `tied-install`; per-skill semver **not** enforced |
| Human authority | SME approves skill PR | Sponsor **consequence ladder**; costly choices explicit |
| Improvement loop | Catalog CI + eval iteration | LEAP, feedback, evaluation cohorts |

---

## Source summary (Google claims only)

Synthesizes [Wave 1 capture](google-agent-skills-ship-like-products.md). Metrics and scale are **Google-reported** unless **spec-observed** in this repo.

- Skills are **behavioral**, not documentation; misplaced instructions change agent tool use and loops.
- **Six gates** before human approval: structural conformance, linters, semver, eval suite + report, links, AI review agent.
- **Semver** quoted string; new skills `1.0.0`; behavioral edits require bump.
- **Eval validator:** atomic expectations, file prompt resolution, duplicate detection, linked report staleness vs HEAD.
- **AI reviewer:** deterministic trap (CLI → `scripts/`), L1/L2/L3 (&lt; 500 line body, flat `references/`, single-hop), non-interactive scripts with JSON stdout.
- **Lessons:** narrow CI scope; atomic expectations; generated `index.json`; cheap gates before LLM-heavy checks.
- **Scale:** 21,000+ stars, 170+ skills, multi-platform distribution (**Google-reported**).

TIED effectiveness vs Google skill evals: **`not_measured`**.

---

## Relationship to sibling comparisons

| Sibling | What it owns | This document owns |
| --- | --- | --- |
| [Google EGM × TIED](google-egm-elephant-goldfish-vs-tied-agent-management.md) | SDD design + Goldfish rubrics | **Catalog CI** for distributed skills at scale |
| [Persante SDD × TIED](persante-sdd-skills-vs-tied-agent-management.md) | Product-repo wiki workflow skills | Google **multi-org skill registry** release discipline |
| [Alibaba OCR × TIED](alibaba-open-code-review-vs-tied-agent-management.md) | Code review precision/recall bench | **Skill content** gates, not diff review |
| [LangWatch × TIED](langwatch-rebuilding-51-days-vs-tied-agent-management.md) | Refactor lint cage + port backlog | Skill **eval evidence** on every change |
| [Cursor harness × TIED](cursor-harness-engineering-vs-tied-agent-management.md) | Session/harness telemetry | Skill **semver** and progressive disclosure |

---

## Harness lessons → TIED agent management

### Ship like products (behavior = release)

| Google pattern | TIED surface | Notes |
| --- | --- | --- |
| Instruction edit = behavioral change | IMPL pseudo-code + checklist edits = logic contract change | **Align** on discipline; different artifacts |
| Mandatory eval on skill PR | REQ tracks use checklist + tests + `tied_verify` | **Tension** — skills lack per-change eval suite |
| Human SME after automation | Sponsor review on costly choices | **Align** intent |

### PR gate stack

| Google pattern | TIED surface | Notes |
| --- | --- | --- |
| Structural conformance (layout, allowlist) | `client-skills-catalog`, bootstrap manifest | **Composable** for bundled skills |
| Skill linters (frontmatter, naming) | [`prompt-type-skills.test.ts`](../../mcp-server/src/e2e/prompt-type-skills.test.ts) frontmatter + name match | **Align** partial |
| Semver gate on behavioral diff | `tied-bundle` methodology version on install | **Gap** per bundled skill |
| Eval suite + fresh report | `record-gf-trial`, demo catalogs — **not** per-skill PR | **Gap** |
| Link validation | Doc link scans in bootstrap tests (scoped) | **Composable** |
| AI review skill | `review-bugbot` skill — advisory | **Composable**; not blocking CI on skill dirs |

### Staged CI (cheap before expensive)

| Google pattern | TIED surface | Notes |
| --- | --- | --- |
| Linters block before LLM eval | Unit/e2e before integration; checklist before heavy MCP | **Align** on **[PROC-TIED_DEV_CYCLE]** ordering |
| Optional `/run-evals` on PR | Sponsor-triggered pilots | **Defer** productization |

### L1/L2/L3 and deterministic trap

| Google pattern | TIED surface | Notes |
| --- | --- | --- |
| L2 &lt; 500 lines | E2e `lines < 500` on prompt-type skills | **Align** |
| `references/` flat, single-hop | `prompt-shared/` indirection in bundled skills | **Align** pattern |
| CLI in `scripts/` not prose | `tied-cli.sh`, Persante `workflow.py` compose examples | **Composable** |
| `scripts/` JSON stdout | MCP tools return structured JSON | **Align** on deterministic plane |

### Catalog hygiene

| Google pattern | TIED surface | Notes |
| --- | --- | --- |
| Generated `index.json` | `manifest.json` + bootstrap tests | **Align** intent |
| Atomic eval expectations | Quality-assurance proof boundaries; inquiry obligations | **Align** literacy |

---

## Touchpoint 1 — RESOLVE

| External term | TIED analogue | Notes |
| --- | --- | --- |
| Skill eval report | Trial readout, quality manifest adjunct | Not Q1 arm without enrollment |
| Skill semver | Methodology snapshot id on client | Per-skill version **Gap** |
| AI review skill | Bugbot / pseudocode fidelity audit prompt | Human/sponsor promotion boundary |
| Gate pass on skill PR | `tied_checklist_gate_validate` on REQ work | Different lifecycle |
| Atomic expectation | Single obligation per eval row | **Align** with QA vocabulary |
| Deterministic trap | MCP-first YAML writes vs prose in AGENTS | **Align** authority split |
| 170 skills / 21k stars | **Google-reported** literacy only | **not_measured** TIED adoption |

### Disposition key

| Disposition | Meaning |
| --- | --- |
| **Align** | TIED already covers the intent in scoped form. |
| **Composable** | Client or store may combine without equivalence claims. |
| **Tension** | Both partly true; separate proof boundaries. |
| **Gap** | External emphasis not in TIED core today. |
| **Defer** | Vendor catalog, client CI, or sponsor choice. |

---

## Primary capability matrix

| Concern | Google skills COG | TIED (this repo) | Disposition | Rationale |
| --- | --- | --- | --- | --- |
| What ships | Skill folder semver bump | REQ/ARCH/IMPL + tests + bundle refresh | **Tension** | Parallel release units |
| Proof on change | Eval with/without skill | Tests + validators + optional inquiry | **Tension** | Different evidence types |
| Structural lint | Six-gate CI | E2e skill contract + `lint_yaml` on YAML | **Composable** | Partial overlap |
| Progressive disclosure | L1/L2/L3 spec | prompt-shared + &lt;500 line rule | **Align** | Implemented for prompt-type set |
| Deterministic work | `scripts/` in skill | `tied-cli`, MCP tools | **Align** | Platform vs harness split |
| AI quality review | Blocking review skill | Advisory Bugbot | **Gap** for blocking |
| Human gate | SME approval | Sponsor ladder + checklist | **Align** intent |
| Cost signal | Eval token + CI time | MCP metrics JSONL, checklist steps | **Composable** | Q5 pairing only |
| Defect proxy | Skill eval pass rate | Confirmed finding vs historical proxy | **Gap** | Never merge arms |
| Catalog scale | 170+ skills | Bundled + client skills via install | **Defer** | Different org model |
| Link/docs drift | lychee + generated index | Bootstrap doc tests (scoped) | **Composable** | |
| Improvement promotion | Internal skills CI | LEAP proposal queue, feedback | **Defer** | |

---

## Evaluation charter mapping (Q1–Q6)

Per [tied-methodology-evaluation-framework.md](../tied-methodology-evaluation-framework.md). Cohort enrollment: **`not_measured`**.

| Q# | Google signal | TIED surface | Disposition |
| --- | --- | --- | --- |
| **Q1** | Skill eval suite pass | Confirmed-finding arm; fidelity pilot | **Tension** — skill green ≠ low ship defects |
| **Q2** | Eval regression vs prior skill version | TIED-to-TIED methodology version compare | **Composable** literacy only |
| **Q3** | Mis-instruction → wrong tool flags | Origin-layer taxonomy (spec→bindings) | **Composable** |
| **Q4** | PR gate pass / checklist adherence | `tied_checklist_gate_validate`, adherence ledger | **Tension** — different receipts |
| **Q5** | Staged CI; LLM eval cost | MCP metrics + checklist wall time + git/PR proxies | **Align** on narrative discipline |
| **Q6** | Atomic expectations; narrow CI scope | Methodology improvement loop; bootstrap tests | **Recommendation-only** |

**External narrative control (compose only):** Google **skill eval reports** and **gate pass rates** illustrate why isolated harness-green leaderboards **mislead** Q1/Q4—they are **not** comparable-arms evidence until Phase 0–3 corpus rows exist.

---

## Authority boundary

```mermaid
flowchart TB
  subgraph googleHarness [Google skill PR harness external]
    pr[Skill PR diff]
    det[Structural linters semver]
    eval[Eval suite report]
    aiRev[AI review skill]
    sme[Human SME]
  end
  subgraph tiedHarness [TIED harness-adjacent]
    skills[Bundled SKILL.md AGENTS PRELOAD]
    e2e[prompt-type-skills.test.ts]
    bugbot[review-bugbot advisory]
  end
  subgraph tiedCore [TIED platform-adjacent core]
    yaml[Project REQ ARCH IMPL YAML]
    gates[tied_checklist_gate_validate]
    verify[tied_verify pseudocode_validate]
    sponsor[Sponsor consequence ladder]
  end
  pr --> det --> eval --> aiRev --> sme
  sme -.->|compose ideas only| tiedHarness
  tiedHarness --> tiedCore
  eval -.x|not Q1 authority| yaml
  aiRev -.x|not gate authority| gates
```

---

## Anti-patterns

| Vendor lesson | TIED risk | Remedy |
| --- | --- | --- |
| Skill **eval pass** marketed as quality | False Q1/Q4 superiority | Separate arms; charter narrative rows |
| **Compound** eval expectations | Noisy gate receipts | Atomic obligations in QA/inquiry design |
| Broad CI rules block typo fixes | Contributor friction in skill edits | Scope checks to skill paths + change type |
| **Raw eval token** tables | Q5 leaderboard abuse | Pair MCP/checklist time; `not_measured` |
| AI reviewer **blocking** without MCP discipline | YAML drift | Keep MCP writes on checklist plane |
| Chained `references/` | Agent stops before L3 load | Keep `prompt-shared` single-hop pattern |

---

## Compose-don’t-replace

| Tune with TIED / store harness | Keep on TIED / sponsor authority |
| --- | --- |
| Staged lint-before-heavy-check ordering in skill PRs | REQ/ARCH/IMPL truth and LEAP |
| Scripts for deterministic skill helpers (`tied-cli` pattern) | `tied_config_get_base_path` before MCP writes |
| L2 size caps and frontmatter parse tests | Checklist gate receipts on REQ tracks |
| Eval **literacy** slides citing Google semver discipline | Cohort defect-rate claims |
| Optional Bugbot on skill diffs | `tied_verify` when verification-gated |

---

## Bounded operator recommendations (recommendation-only)

1. **Treat bundled skill edits like micro-releases** — run `prompt-type-skills` e2e locally before merge; document user-visible behavior changes in CHANGELOG even without per-skill semver until Wave 3.
2. **Stage checks** — YAML lint and unit tests before optional LLM-heavy dogfood trials (`record-wf-trial`).
3. **Atomic feedback** — one criterion per trial grading row in demo readouts (mirror Google eval lesson).
4. **Authority** — skill prose must not imply MCP may write project YAML without checklist steps.
5. **Literacy** — cite **Google-reported** gate stack only alongside TIED **not_measured** until evaluation corpus enrollment.

---

## Phased recommendations (doc-first)

| Phase | Scope | Default |
| --- | --- | --- |
| **0** | Wave 1+2 capture and analysis | **Done** (2026-11-07) |
| **1** | Evaluation framework external-narrative rows | **Done** (charter compose-only) |
| **2** | Methodology composition matrix §2 row “Google Agent Skills CI” | **Defer** |
| **3** | Per-skill `metadata.version` + semver gate in e2e | **Defer** (`add-feature`) |
| **4** | Minimal eval suite scaffold per bundled skill | **Defer** |
| **5** | `/run-evals` manual PR comment for heavy suites | **Defer** |

---

## Explicit non-adoptions

- Google skill **eval pass rate** as TIED methodology effectiveness proof.
- Mandatory Google-style **six gates** replacing `tied_checklist_gate_validate` on REQ work.
- Importing Google’s **170-skill catalog** into `tied-install.sh` as default client payload.
- Blocking **AI review skill** as sole quality gate without human sponsor on costly changes.
- Per-skill semver **without** scoped REQ and bootstrap contract tests.

---

## Proof boundary

| Claim type | Boundary |
| --- | --- |
| Stars, skill count, gate list | **Google-reported** |
| TIED `prompt-type-skills` e2e rules | **TIED-existing**; structural skill shape, not ship outcomes |
| Compose recommendations | **Recommendation-only** |
| This document | Outreach **reference only**; no REQ/ARCH/IMPL minted in body |
| Wave 3 behavior | Requires scoped checklist + tests |

---

## Related documents

- [google-agent-skills-ship-like-products.md](google-agent-skills-ship-like-products.md) — Wave 1 capture
- [tied-methodology-evaluation-framework.md](../tied-methodology-evaluation-framework.md) — Q1/Q4/Q5/Q6 narrative control
- [persante-sdd-skills-vs-tied-agent-management.md](persante-sdd-skills-vs-tied-agent-management.md) — Product-repo skills
- [external-service-three-wave-comparison-template.md](../../tied-bundle/docs/external-service-three-wave-comparison-template.md)
- [PLAN.md](../../tied-project/non-tied-plans/google-agent-skills-vs-tied/PLAN.md) — Non-tied track handoff

---

## Wave 1+2 exit record (default depth)

**Recorded depth:** `depth_tier: minimal`, `gate_policy: advisory`, `profile_depth: not_measured`, CITDP **skipped** ([citdp-policy.md](../../tied-bundle/docs/citdp-policy.md) — non-executable documentation).

### Wave 1

- [x] Capture metadata + TLDR + Notes for stdd readers
- [x] Vendor metrics labeled **Google-reported**
- [x] Sibling analysis link in metadata
- [x] Operator-local publish (no `.gitignore` allowlist)

### Wave 2

- [x] Required template sections 1–14 present
- [x] No REQ/ARCH/IMPL tokens minted in body
- [x] TIED effectiveness **`not_measured`**
- [x] Evaluation charter external narrative rows + relationship table link
- [x] Matrix §2 row **not** added
- [x] Wave 3 **Defer** unless sponsor **`add-feature`**
