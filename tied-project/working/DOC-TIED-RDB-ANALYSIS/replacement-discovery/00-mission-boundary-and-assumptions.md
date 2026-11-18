# 00 — Mission, boundary, and assumptions

| Field | Value |
| --- | --- |
| **Engagement** | `DOC-TIED-RDB-ANALYSIS` |
| **Git revision (charter)** | `c8353309` (store `main` at scaffold; update when re-baselining) |
| **RDB phases in scope** | 0–7 (analysis) |
| **RDB phases deferred** | 8–11, artifacts 10–13, next-generation product replacement |
| **Authority** | Sponsor (Fareed); agents execute read-only discovery unless explicitly authorized |

## Mission

Document **current** TIED methodology store behavior—value delivered, observable contracts, mechanisms, data boundaries, quality signals, and verification assets—so a future replacement program (if authorized) can start from evidence, not from a code rewrite spec.

**Not in mission:** Design or implement a successor product; migrate users; change guarantees; approve eliminations.

## Beneficiaries (analysis consumers)

- **Sponsor** — decides whether and when to open Wave 3+ replacement.
- **Implementers** — need accurate contracts and topology of `stdd` today.
- **Client operators** — need faithful description of install, MCP, and checklist behavior as shipped.
- **Agents** — need evidence-backed entry points and failure modes before large changes.

## System boundary (stdd)

| In scope | Out of scope |
| --- | --- |
| `tied-bundle/` methodology corpus (read-only client copy semantics) | Client-specific product repos except as **documented contract** |
| `mcp-server/`, MCP tool surface, resources | Third-party IDEs except integration boundaries |
| `tools/bootstrap`, `tied-install`, prompt-type skills | Production operator secrets |
| `tied-project/` store indexes, `citdp/`, `working/`, harness readouts under `docs/agent-harness-evaluation/` | Executing migration or parallel “new TIED” codebase |

## Safety and access

- **Default:** read-only discovery (no production data, no credential harvesting).
- **MCP:** `TIED_BASE_PATH` = this repo’s `tied-project/` for sessions mutating only analysis artifacts under `working/DOC-TIED-RDB-ANALYSIS/`.
- **BFIE mode:** `report_only`; dispositions `observed` / `inferred` / `unknown` / `unresolved` only.

## Evidence inventory (initial)

| Class | Locations (non-exhaustive) |
| --- | --- |
| Source | `mcp-server/src/`, `tools/bootstrap/`, root scripts |
| Tests | `mcp-server/src/**/*.test.ts`, factory tests under `mcp-server/src/e2e/` |
| Methodology docs | `tied-bundle/docs/`, `docs/methodologies/`, `AGENTS.md` |
| Process / harness | `docs/agent-harness-evaluation/readouts/`, WF trial working folders |
| Prior comprehension | [DOC-STDD-TIED-PROJECT-BROWNFIELD](../DOC-STDD-TIED-PROJECT-BROWNFIELD/) (compose; supersede only with new EV-*) |

## Assumptions

1. TIED store repo is the **authoritative** implementation of methodology tooling analyzed here.
2. REQ/ARCH/IMPL index **status** fields are **declared intent**, not verified sign-off, unless `tied_verify` receipt attached (per EDPC boundary).
3. Long-term replacement of TIED remains **hypothesis** until Wave 3+ sponsor gate.

## Explicit deferral (sponsor 2026-11-18)

Phases **8–11** of the RDB runbook and files `10-replacement-opportunities.md` through `13-decision-log-and-readiness-review.md` are **not** engagement deliverables. Draft HYP may appear only in `09-*` or `opportunities-inbox.md` with banner `not_approved_for_replacement`.

---

## Slice 1 — Governance, scope, and authority (RDB phase 0)

**Completed:** 2026-11-18 · **Evidence revision:** `c8353309` (analysis commits may advance; rebaseline `00` when merging)

### Authority stack (observed)

| Layer | Artifact | Role in this engagement |
| --- | --- | --- |
| **Sponsor** | Verbal/chat scope steer | Analysis-only; replacement deferred (2026-11-18) |
| **Program plan** | [replacement-discovery-baseline/PLAN.md](../../non-tied-plans/replacement-discovery-baseline/PLAN.md) | Phase gate 0–7 vs 8–11; slice order; completion gates G-0–G-9 |
| **Working plan** | [DOC-TIED-RDB-ANALYSIS/PLAN.md](../PLAN.md) | Executable copy; links parent plan + runbook |
| **Methodology runbook** | [replacement-discovery-baseline-runbook.md](../../../docs/methodologies/replacement-discovery-baseline-runbook.md) | Full v1.0 reference; header scopes analysis-only pilot |
| **Agent loader** | [AGENTS.md](../../../AGENTS.md) | Session bootstrap, MCP-first YAML, wrong-`TIED_BASE_PATH` mitigation |
| **Non-TIED lane** | [non-tied-boundary.md](../../../tools/bundled-prompt-type-skills/prompt-shared/non-tied-boundary.md) | This engagement: no REQ/ARCH/IMPL writes; optional `non-tied-plans/` + `working/DOC-*` |
| **Artifact placement** | [working-artifact-placement.md](../../../tied-bundle/docs/working-artifact-placement.md) | This DOC under **committed** `tied-project/working/`; machine gates under `tied-bundle/working/` if used |

### Engagement lane (CON-001)

| Field | Value |
| --- | --- |
| **id** | CON-001 |
| **statement** | `DOC-TIED-RDB-ANALYSIS` uses the non-TIED DOC working pattern: committed analysis markdown/YAML only; no `tied_verify` update; no project index mutation unless sponsor opens `@add-feature`. |
| **status** | observed |
| **evidence** | EV-000, EV-002, EV-003 |

### Store vs client layout (CON-002)

| Field | Value |
| --- | --- |
| **id** | CON-002 |
| **statement** | In the **store** repo, methodology corpus is git-tracked under `tied-bundle/`; client-specific obligations and working evidence under `tied-project/`. Agents must not treat `tied-bundle/` as writable project data in clients ([PROC-TIED_METHODOLOGY_READONLY] per AGENTS.md). |
| **status** | observed |
| **evidence** | EV-004 |

### MCP write boundary (CON-003)

| Field | Value |
| --- | --- |
| **id** | CON-003 |
| **statement** | MCP YAML index writes target only `tied-project/{requirements,architecture-decisions,implementation-decisions,semantic-tokens}.yaml` keys; merged methodology∪project view is read/validate only. |
| **status** | observed |
| **evidence** | EV-004 |

### Session bootstrap contract (CON-004)

| Field | Value |
| --- | --- |
| **id** | CON-004 |
| **statement** | Agents are instructed to call `tied_config_get_base_path` before MCP writes and to read vocab routing before TIED YAML/source on full TIED lanes; analysis lane still benefits from base-path check when using read-only MCP survey tools. |
| **status** | observed |
| **evidence** | EV-004, EV-005 |

### Runbook scope vs program plan (CON-005)

| Field | Value |
| --- | --- |
| **id** | CON-005 |
| **statement** | Runbook v1.0 text includes replacement phases 8–11; **committed plan + runbook header** narrow this pilot to phases 0–7. Readers must not treat runbook phase 8–11 gates as current deliverables. |
| **status** | observed |
| **evidence** | EV-006 |

### MCP binding (this session)

| Check | Result |
| --- | --- |
| `tied_config_get_base_path` | `project_root` = `/Users/fareed/Documents/dev/chatgpt/stdd`, `base_path` = `.../tied-project`, `binding_status` = **ok** |
| Recorded as | EV-005 · resolves GAP-002 |

### Gate G-0

| Criterion | Met |
| --- | --- |
| Charter + git revision | Yes (`c8353309` at slice 1; update on commit) |
| Deferral 8–11 | Yes (above + runbook header EV-006) |
| Stdd boundary table | Yes (§ System boundary) |
| Governance authority map | Yes (this section) |