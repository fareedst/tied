# PLAN — [REQ-TRIAL_METHODOLOGY_VERSION_READOUT]

**Trial context:** TIED methodology **store** repo (facilitator skills, WF batch YAML, GF catalog bootstrap).

**Phase:** `build-plan` complete · **`plan_phase: verification`** (close-out deferred)

**Request token:** `REQ-TRIAL_METHODOLOGY_VERSION_READOUT`  
**Workflow:** `@add-feature` → `@refine-plan` → `@build-plan` → `@close-out`

**Sponsor remainder (resolved):** TIED methodology **semver** must appear in **`@record-wf-trial`** and **`@record-gf-trial`** readouts. Session capture uses MCP **`server_info`** → `extensions.tied.methodology` ([REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND], [REQ-MCP_SERVER_INFO]), persisted on the disposable client because orchestrator **process logs do not tee MCP tool I/O** ([REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG]).

---

## Problem statement (locked)

| Surface | Current | Desired |
| --- | --- | --- |
| WF/GF readouts | Optional “TIED x.y.z dogfood” from **bootstrap git** commit message | **Metadata table** + dogfood section cite **session evidence** (version + source + path) |
| WF turn 1 (`add-feature`) | Seeds interaction inventory only | Also writes **`tied-methodology-version.session.v1.json`** (+ optional inventory mirror fields) |
| GF (`@add-feature` disposable) | No normative capture step | Same evidence file under working `evidence/` early in session |
| Process log review | Cannot recover `server_info` payload | Optional orchestrator **`DIAGNOSTIC:`** line at run start — **secondary**, not primary |

**Evidence gap:** Readouts like [trial-readout-PROMPT-WF-05-composer25-1794042383…](docs/demos/trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md) (**TIED 4.1.0** from bootstrap) vs success cell **4.2.0** show bootstrap-git inference is fragile for cohort comparison.

---

## Scope

| In | Out |
| --- | --- |
| `tools/bundled-record-wf-trial-skill/` + `tools/bundled-record-gf-trial-skill/` SKILL + reference | Backfilling all historical `docs/demos/trial-readout-*.md` |
| `docs/demos/traditional-four-phase-agentstream.yaml` turn-1 `goal` | Changing agentstream MCP logging / transcript capture |
| `tools/bundled-prompt-type-skills/prompt-shared/trial-session-methodology-version-capture.md` + GF catalog bootstrap note | Mandatory per-turn `TIEDv{semver}:` stamp (conflicts [REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND]) |
| JSON contract + example under `mcp-server/contracts/trial-methodology-version/` | Effectiveness / leaderboard claims |
| Contract tests (`tools/bootstrap/lib/trial-methodology-version-readout-contract.test.mjs`) | Facilitator auto-run on every matrix cell in CI |
| Optional: orchestrator stderr `DIAGNOSTIC` via `read-tied-methodology-version.mjs` in WF wrapper | Rewriting `readTiedMethodologyVersion` (reuse existing) |
| `tied-project/vocab/agentstream.md`, `project-operations-mcp.md` RECORD | Store REQ tokens for subject **product** on disposable clients |

---

## Locked decisions (refine-plan)

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-EVIDENCE-CANONICAL** | **`tied-project/working/{REQ-TOKEN}/evidence/tied-methodology-version.session.v1.json`** is canonical; inventory fields are a **mirror** for cohort grep | Matches interaction-inventory location; facilitator glob is stable |
| **D-SCHEMA** | `schema`: `tied-methodology-version.session.v1`; required: `version`, `source`, `captured_at`, `capture_path` (`mcp_server_info` \| `tied_cli_server_info`); optional: `turn`, `server_info_schema_version` | Aligns with [server_info example](mcp-server/contracts/server_info/server_info.response.example.json) |
| **D-CAPTURE-ORDER** | Agent: `tied_config_get_base_path` → `server_info` (or `tied-cli.sh server_info '{}'`) → write evidence → one line in phase handoff | Session bootstrap order in AGENTS; no chat-only semver |
| **D-FACILITATOR-FALLBACK** | Resolution order: (1) evidence file (2) inventory mirror (3) facilitator `server_info` on client into store working evidence (4) `install.json` **bootstrap pin** (5) git bootstrap **uncertain** | Grandfather pre-ship trials; fail closed on conflicting (1) vs (5) |
| **D-GRANDFATHER** | Republish of old readouts: label **bootstrap-inferred only** when (1) missing; do not block `--force` | **Costly** to require backfill |
| **D-ORCH-DIAG** | Add optional stderr `DIAGNOSTIC: tied_methodology_version=… source=…` at WF orchestrator bind — **secondary** to evidence file | Process-log friction review only |
| **D-GF-PATH** | GF: link capture doc from [catalog-greenfield-plan-new-feature-prompts.md](docs/demos/catalog-greenfield-plan-new-feature-prompts.md) bootstrap steps + `@add-feature` session bootstrap (no separate skill tree) | GF catalog already says `@add-feature` |
| **D-TOKENS** | `REQ-TRIAL_METHODOLOGY_VERSION_READOUT`, `ARCH-TRIAL_METHODOLOGY_VERSION_READOUT`, `IMPL-TRIAL_METHODOLOGY_VERSION_READOUT` | Facilitator + batch only |

---

## Module boundaries

```text
mcp-server/contracts/trial-methodology-version/     # session evidence v1 example (+ optional schema)
docs/demos/traditional-four-phase-agentstream.yaml  # turn 1 goal
docs/demos/catalog-traditional-workflow-trial-prompts.md  # inventory appendix fields
docs/demos/catalog-greenfield-plan-new-feature-prompts.md # bootstrap note
tools/bundled-record-{wf,gf}-trial-skill/           # mandatory readout contract
tools/bundled-prompt-type-skills/prompt-shared/     # trial-session-methodology-version-capture.md
tools/bootstrap/lib/trial-methodology-version-readout-contract.test.mjs
scripts/run-traditional-four-phase-agentstream.sh or workflow-trial-agentstream.sh  # optional DIAGNOSTIC
tied-project/vocab/agentstream.md, project-operations-mcp.md
```

---

## Acceptance criteria (build-plan maps to tests)

| ID | Criterion | Verification |
| --- | --- | --- |
| SC-TMV-01 | Turn-1 batch `goal` names `server_info` and evidence filename | Contract test on `traditional-four-phase-agentstream.yaml` |
| SC-TMV-02 | `record-wf-trial` / `record-gf-trial` reference require metadata **TIED methodology version (session)** | Grep contract test |
| SC-TMV-03 | Example JSON validates against contract | Ajv or fixture assert in bootstrap test |
| SC-TMV-04 | Facilitator discovery order documented in both reference.md files | Same contract test |
| SC-TMV-05 | Optional orchestrator DIAGNOSTIC line present when enabled | Shell composition test (if implemented in build-plan) |

---

## Dependencies

| Token | Relationship |
| --- | --- |
| [REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND](tied-project/requirements/REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND.yaml) | `server_info` semver path |
| [REQ-MCP_SERVER_INFO](tied-project/requirements/REQ-MCP_SERVER_INFO.yaml) | `extensions.tied.methodology` |
| [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG](tied-project/requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml) | Process log ≠ MCP log |
| [REQ-TIED_CLIENT_OPERATOR_TOOLING](tied-project/requirements/REQ-TIED_CLIENT_OPERATOR_TOOLING.yaml) | `install.json` `store_methodology_version` fallback label |

---

## Risk / depth

| Field | Value |
| --- | --- |
| `depth_tier` | minimal |
| `gate_policy` | advisory |
| Consequence ladder | **Reversible** — docs/skills/batch; **Costly** — mandatory backfill of all readouts; **Costly** — reintroducing per-turn `TIEDv` stamp |

---

## Test strategy

See [test-strategy.md](./test-strategy.md).

---

## Build-plan sequence (for `@build-plan`)

1. Mint REQ/ARCH/IMPL + semantic tokens via TIED MCP; CITDP persist after GREEN.
2. RED: contract tests SC-TMV-01..04.
3. Add contract example JSON; prompt-shared capture doc; batch turn-1 goal; catalog appendix.
4. Update facilitator SKILL/reference (metadata row mandatory; discovery order).
5. GREEN contract tests; optional orchestrator DIAGNOSTIC + SC-TMV-05.
6. `tied_validate_consistency`; advisory `pre_implementation` gate with tracker.

---

## Handoff

**`plan_phase`:** `pre-implementation`  
**Do next:** `@build-plan` linked to this `PLAN.md` (ARCH/IMPL pseudo-code, RED tests, implementation).
