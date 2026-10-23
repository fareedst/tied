# AI-SDLC ATDD Software Factory × TIED — refined plan (pass 1)

| Field | Value |
| --- | --- |
| **Working token** | `DOC-AI-SDLC-FACTORY-COMPARISON` (outreach doc bundle; **no REQ mint**) |
| **Refined** | 2026-10-23 |
| **Target evidence** | Local read-only inspection of `/Users/fareed/Downloads/AI-SDLC-ATDD-SoftwareFactory-main` — **target-repo-observed/documented**; tests and run records **not** re-executed in this wave |
| **Process** | [external-service-three-wave-comparison-template.md](../../../tied-bundle/docs/external-service-three-wave-comparison-template.md) — **Wave 2 only** (repo-as-source; optional Wave 1 capture **Defer**) |
| **Sibling pattern** | [Traefik × TIED](../../../docs/comparisons/traefik-harness-platform-vs-tied-agent-management.md), [LangChain × TIED](../../../docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md), [Heimsbakk × TIED](../../../docs/comparisons/veronika-heimsbakk-ai-generated-ontologies-vs-tied-agent-management.md) |

---

## Refine (Touchpoint 1 — RESOLVE)

**PRELOAD (session):** [tied-methodology.md](../../../tied-project/vocab/tied-methodology.md), [pseudocode-and-citdp.md](../../../tied-project/vocab/pseudocode-and-citdp.md), [quality-assurance.md](../../../tied-project/vocab/quality-assurance.md) (proof boundaries), [sponsor-agent-relationship.md](../../../tied-project/vocab/sponsor-agent-relationship.md).

| Factory / target term | TIED canonical term | Layer | Notes |
| --- | --- | --- | --- |
| **Software Factory** (platform product vision) | Methodology **compose** target, not TIED core | Outreach | PetClinic is reference app, not product — **Factory-reported** |
| **Protected `spec/`** (agent read-only) | Checklist gates + adversarial depth; **not** filesystem ACL in TIED | Process | TIED uses MCP/checklist authority, not repo guard middleware alone |
| **Frozen executable expectations** | IMPL **essence_pseudocode** + RED tests before code | Traceability | Same epistemic order; factory uses Gherkin/OpenAPI instead of REQ YAML |
| **Red-first protected tests** | Strict TDD + composition tests ([PROC-TIED_DEV_CYCLE](../../../tied-bundle/docs/processes.md)) | Process | **Align** on “fail on creation”; TIED adds IMPL block comments |
| **Gherkin / BDD features** | Behavior specs at **harness-adjacent** layer | Harness | Maps to E2E/composition where UI required; not REQ token substitute |
| **OpenAPI / domain contracts** | Binding inventory + contract tests | Architecture | TIED `[ARCH-*]` + tests; factory `spec/contracts/` |
| **Black-box HTTP harness** | Composition tests without UI | Tests | **Composable** with module validation mandate |
| **Run record + exact-tree hash** (`spec/run-all.js`) | Request evidence envelope, quality manifests, gate receipts | Evidence | **Gap** for tree-hash import — Wave 3 candidate only |
| **Delivery controls** (`spec/delivery/`, CTL-*) | Assurance profiles, evidence chain profile | Quality | **Partial align** — TIED has profiles; factory has SSDF/NIST tags in runner |
| **Local IDs** (`D-*`, `A-*`, `OBS-*`, `CTL-*`, `REV-*`, `GAP-*`) | `[REQ-*]` / `[ARCH-*]` / `[IMPL-*]` + vocab | Traceability | **Bridge table** in analysis — do **not** mint parallel authoritative tokens |
| **Reconstruction experiment** (delete service, rebuild) | EASAR / brownfield recovery **analog**, not equivalent | Research | **Composable** as operator experiment doc; not TIED proof |
| **Independent review / rehearsals** | Sponsor **person branch**, claims-evidence review | Governance | **Align** with agency boundary; factory `docs/rehearsals/` |
| **Human freeze, agent build** | Sponsor costly choices + **RESOLVE charter** | Cross-cutting | Agents implement; humans own intent authority |

**Ambiguity cleared:** Deliverable is **one Wave 2 analysis file** plus `.gitignore` allowlist. No TIED YAML mutation, no target `npm test`, no run-record generation in this plan.

**Adversarial / depth:** `profile_depth: **minimal**` — documentation-only outreach; external repo is local read-only; no auth/network/persistence behavior change in stdd. Integrated inquiry **Defer**.

**Consequence ladder:**

| Decision | Class | Default |
| --- | --- | --- |
| Publish Wave 2 comparison + git allowlist | Reversible | Proceed at **build-plan** |
| Operator crosswalk subsection (doc-only P1) | Reversible | Proceed if sponsor wants same PR |
| Wave 1 capture `ai-sdlc-atdd-software-factory.md` in repo | Reversible | **Defer** — analysis cites target paths + README summary |
| Matrix row in [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md) | Costly | **Defer** |
| Wave 3 REQ (run-record import, protected-spec profile) | Costly | **Defer** — list in analysis only |
| Project vocab RECORD (`executable specification factory`, `exact-tree gate`) | Costly | **Defer** unless sponsor asks |

**Gate (refine-plan):** `pre_implementation` validated for outreach DOC token at **build-plan** with [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml); refine pass does not write comparison deliverables.

---

## Plan (CITDP-lite)

**Change class:** Methodology outreach — **single comparison markdown** under `docs/comparisons/` (**no** project REQ/ARCH/IMPL index mutation).

**Impact:**

| Area | Blast radius |
| --- | --- |
| `docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md` | New allowlisted file |
| `.gitignore` | One new `!docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md` |
| Optional P1 bundle docs | **Defer** unless sponsor expands scope (crosswalk in `tied-bundle/docs/` or client-development-index row) |

**Risk:** Conflating factory **local IDs** with TIED semantic tokens — mitigated by bridge table + explicit non-adoptions. Claiming factory effectiveness as TIED proof — mitigated by **target-repo-observed** / **not_measured** labels.

**LEAP / CITDP persist:** **Defer** — no `tied-project/citdp/CITDP-*.yaml` until Wave 3 behavior.

**Out-of-scope capture:** Wave 3 candidates documented in analysis § phased recommendations; optional `tied_feedback_operational_add` after P0 ships (**Defer**).

---

## Test strategy (doc-only)

1. **Scope grep:** `rg 'REQ-[A-Z]|ARCH-[A-Z]|IMPL-[A-Z]' docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md` — expect **no new minted tokens in body** (reference-only citations to existing stdd tokens OK).
2. **Claim labels:** Manual pass — metrics (e.g. Checkout Python rebuild, zero interventions) labeled **Factory-reported**; TIED effectiveness **not_measured**.
3. **Links:** Relative links to template, Traefik/LangChain/Heimsbakk siblings, `AGENTS.md`, checklist, [tied-vs-well-known-methodologies](../../../docs/comparisons/tied-vs-well-known-methodologies.md) resolve from `docs/comparisons/`.
4. **Section parity:** All **14** Wave 2 template sections present in order (see Implement).
5. **Evidence boundary:** Document states target tests/run records were **not** re-run in stdd workspace.
6. **Lint:** No `lint_yaml` (no TIED YAML changed). Optional markdown link check.

---

## Implement (execution order — sponsor runs **build-plan**)

### Phase 0 — Git allowlist

Add to [`.gitignore`](../../../.gitignore) after Heimsbakk lines:

```gitignore
!docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md
```

### Phase 1 — Wave 2 analysis

Create [docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md](../../../docs/comparisons/ai-sdlc-atdd-software-factory-vs-tied.md) with **required sections in order**:

1. **Metadata table** — Purpose, Audience, **Source** (local repo path + upstream identity if known), **Evidence boundary** (read-only inspection date), Status, Executable follow-up (Wave 3 list), **Distinct from** (harness comparisons vs executable-spec factory), TIED anchors
2. **Executive summary** — Factory COG (frozen executable spec, protected tests, run records, reconstruction) vs TIED COG (REQ→ARCH→IMPL, CITDP, gates, `tied_verify`); **compose-don’t-replace**
3. **Source summary (Factory claims only)** — From README, PROJECT-PLAN, architecture.md — bullet claims only
4. **Relationship to sibling comparisons** — Own **ATDD/executable-spec/factory** lens; cross-link Traefik **seam**, LangChain **trace bench**, Ludanyi **measurement**, Heimsbakk **meaning**, [tied-vs-well-known-methodologies](../../../docs/comparisons/tied-vs-well-known-methodologies.md)
5. **Harness lessons → TIED agent management** — Thematic subsections + mapping tables:
   - Specification-first workflow vs documentation-first TIED
   - Protected spec / GUARD vs MCP YAML authority
   - Gherkin + contracts + OBS/CTL vs vocab + REQ + evidence manifests
   - `run-all.js` tiers, cache, `--verify`, tree hash vs checklist gates + manifests
   - Agent AGENTS.md + development-workflow vs stdd AGENTS.md + prompt-types
   - Reconstruction / demo tools vs EASAR/recovery **analog**
6. **Touchpoint 1 — RESOLVE** — Vocabulary bridge (factory local ID ↔ TIED surface); disposition key; claim labeling
7. **Primary capability matrix** (~12–15 rows) — use template dispositions
8. **Authority boundary** — Mermaid: factory freeze/build loop → harness-adjacent (BDD, runner) → TIED core (gates, MCP, verify, sponsor ladder)
9. **Anti-patterns** — e.g. treating chat as spec; weakening protected tests; run record without tree hash; minting REQ from comparison prose
10. **Compose-don’t-replace table**
11. **Bounded operator recommendations (Recommendation-only)** — doc crosswalk, black-box experiment guidance, local-ID bridge, second-application criterion
12. **Phased recommendations** — Phase 0 = this doc; Phase 1+ Wave 3 **Defer** defaults
13. **Explicit non-adoptions** — adopting factory as TIED replacement; OWL/reasoner N/A; certifying factory; auto-import run records without REQ
14. **Proof boundary + Related documents**

**Target evidence files (read-only during authoring):**

| File | Use in analysis |
| --- | --- |
| Target `README.md` | Identity, PetClinic boundary, status claims |
| `PROJECT-PLAN.md` | Roadmap, reconstruction protocol, factory shape |
| `docs/development-workflow.md` | Build/delivery sequences |
| `spec/README.md` | Protected spec layout |
| `spec/run-all.js` | Run record, tree hash, tier/cache/verify semantics |
| `tools/demo/README.md` | Reconstruction demo boundaries |
| `docs/decisions/architecture.md` | A-* decisions, guard, black-box |

### Phase 2 — Optional P1 doc compose (**Defer** default)

- Short crosswalk appendix in `tied-bundle/docs/client-development-index.md` or dedicated operator note — only if sponsor expands scope in same PR.

### Phase 3 — Verification (P0)

- Run test strategy checks 1–5.
- `tied_validate_consistency` — **skip** if no project YAML touched (expected).

---

## Wave 2 — Primary capability matrix (draft rows for analysis)

| Concern | TIED COG | Disposition | One-line rationale |
| --- | --- | --- | --- |
| Freeze human-owned expectations before code | REQ/ARCH/IMPL + vocab RESOLVE | **Align** | Same ordering as factory spec lock |
| Agent cannot mutate verification | Protected tests + gates | **Align** | TIED: tests + MCP/checklist, not only `spec/` ACL |
| Executable spec (Gherkin/OpenAPI) | IMPL pseudo-code + tests | **Composable** | Different artifact shapes; same proof intent |
| Red baseline before implementation | TDD + composition-first | **Align** | Factory explicit; TIED mandatory cycle |
| Exact-tree test gate | — | **Gap** | Factory run record + hash; TIED has manifests/receipts, not identical |
| Run record JSON for reviewers | Request evidence envelope | **Partial align** | Wave 3 import candidate |
| OBS/CTL delivery tagging | Assurance / evidence chain profile | **Partial align** | Both tag evidence classes |
| Local D/A/OBS IDs vs semantic tokens | `[REQ-*]` graph | **Tension** | Bridge only; no second authority |
| Black-box service harness | Module validation + contract tests | **Align** | Both forbid UI-only proof for bindings |
| Reconstruction from spec+tests | EASAR Mode C analog | **Composable** | Factory experiment ≠ TIED recovery engagement |
| Platform factory product (multi-app) | TIED client install + methodology | **Defer** | stdd is methodology store, not factory SKU |
| Chat as requirements record | — | **Anti-pattern align** | Both prefer durable artifacts over session |
| Independent review rehearsals | Sponsor/reviewer person branch | **Align** | Factory REV-* records map to claims review |
| Second app before core extraction | — | **Defer** | Factory roadmap constraint; not TIED policy |

---

## Wave 3 candidates (analysis only — no implementation in this plan)

| Candidate | Change class | Trigger |
| --- | --- | --- |
| Run-record / tree-hash fields in request evidence envelope | Behavior + YAML | Sponsor **add-feature** after envelope schema review |
| Client profile: protected spec + runtime contracts | Behavior | Second factory-style client |
| Local-ID → token traceability adapter (read-only) | Tooling | Operator demand |
| Reconstruction runner skill (experiment) | Doc/skill | Pilot on non-production repo |
| Factory-core extraction | Product | Factory’s own second-application gate |

---

## Proof boundary (unchanged)

Factory PetClinic outcomes are **Factory-reported** unless independently reproduced in stdd. This comparison does not certify the factory, authorize its use, or mint REQ/ARCH/IMPL from prose. Wave 3 only via scoped **add-feature** / **build-plan**.
