# DAE mechanism incorporation — linked plan

| Field | Value |
| --- | --- |
| **REQ** | [REQ-TIED_DAE_INCORPORATION](../../tied/requirements/REQ-TIED_DAE_INCORPORATION.yaml) (**Implemented**) |
| **ARCH** | [ARCH-TIED_DAE_INCORPORATION](../../tied/architecture-decisions/ARCH-TIED_DAE_INCORPORATION.yaml) (**Active**) |
| **IMPL** | [IMPL-TIED_DAE_INCORPORATION](../../tied/implementation-decisions/IMPL-TIED_DAE_INCORPORATION.yaml) (**Active**) · [pseudo-code](../../tied/implementation-decisions/IMPL-TIED_DAE_INCORPORATION-pseudocode.md) |
| **CITDP** | [CITDP-REQ-TIED_DAE_INCORPORATION](../../tied/citdp/CITDP-REQ-TIED_DAE_INCORPORATION.yaml) (`phase: closed`) |
| **Child charter** | [REQ-TIED_DAE_VERIFICATION_CHARTER](../../tied/requirements/REQ-TIED_DAE_VERIFICATION_CHARTER.yaml) (**Implemented**) |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) (program close-out complete) |
| **Post-close-out** | [RESIDUAL-PLAN.md](./RESIDUAL-PLAN.md) — R1–R4 **closed** (2026-09-25) |
| **Coordinator guide** | `docs/comparisons/dae-mechanisms-for-tied-improvement.md` (**local private** — gitignored) |
| **Methodology comparison** | `docs/comparisons/tied-vs-disciplined-agentic-engineering.md` (**local private** — gitignored) |
| **profile_depth** | **`minimal`** (program + waves; residual slices used same policy) |
| **gate_policy** | `advisory` |
| **Last updated** | **2026-09-25** (PLAN reconcile — Implemented stack; comparison docs private) |

---

## Goal

Deliver a **multi-wave program** that incorporates useful **Disciplined Agentic Engineering (DAE)** enforcement patterns into TIED **without** replacing the token graph, IMPL `essence_pseudocode`, persisted CITDP, or composition-before-wiring discipline. **This PLAN** is the **tracked** executable history (wave contracts, disposition log, close-out). Optional **private** coordinator/comparison notes may live under `docs/comparisons/` (gitignored — maintain locally, not in git).

## Non-goals

- Shipping swingerman/engineer as the default TIED client workflow.
- Making Gherkin the sole behavior intermediate representation (optional acceptance layer only).
- Replacing CITDP or LEAP with DAE handoffs-only audit trails.
- Requiring per-feature stdlib Python `dae_*.py` in the TIED **methodology** repo (Node MCP/CLI remains the gate surface).
- Conflating this program with [`claude-code-tied-multi-harness-plan.md`](../../docs/comparisons/claude-code-tied-multi-harness-plan.md) (closed harness program unless sponsor reopens scope).
- Forking gate semantics into a second validator; all new CLI/MCP wrappers **compose** `tied_checklist_gate_validate` (and related tools) unchanged.

## Success criteria

1. **Doc split:** Coordinator guide states its role, links here, and does not duplicate full wave acceptance tables or slice contracts.
2. **Traceability:** REQ/ARCH/IMPL + CITDP draft exist; each future wave enters via **`build-plan`** with Tracker + gate receipts.
3. **Wave 0:** Shipped gate surface documented; no regression in `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]` tools.
4. **Waves 1–5:** Close per-wave acceptance using the **Wave contracts** section (tests or documented charter N/A).
5. **`tied_validate_consistency`** passes after each TIED stack mutation.

---

## Resolved sponsor terms (Refine)

| Sponsor term | Resolution | Status |
| --- | --- | --- |
| One **full-project guide** under `docs/comparisons/` | **`dae-mechanisms-for-tied-improvement.md`** — **coordinator guide** (status matrix, complementarity, anti-patterns). | Resolved 2026-09-24 |
| Convert the **other** comparison doc | **`tied-vs-disciplined-agentic-engineering.md`** **stays** evaluator-side; executable waves only in **this PLAN** (interpretation **A**). | Resolved 2026-09-24 |
| REQ token name | **`REQ-TIED_DAE_INCORPORATION`** (program scope, not gate-only). | Resolved 2026-09-24 |
| Wave breakdown | Aligns with coordinator “implementation sequence (revised 2026-09-24)” → **Waves 0–5**. | Resolved 2026-09-24 |
| W1a CLI name (“name TBD”) | Locked: **`tied gate check`** (`@tied/cli` subcommand group `gate` + action `check`). MCP mirror: optional thin wrapper calling the same composition function; no parallel Python script. | **Resolved 2026-09-24 refine-plan** |
| W1c handoff vs envelope | Handoff-shaped **phase criterion YAML** is **additive** under `working/{REQ}/handoffs/`; it **does not** replace `request-evidence-envelope.v1.json` or CITDP. Envelope remains close-out packaging; handoff YAML is Step-0 criterion evidence. | **Resolved 2026-09-24 refine-plan** |
| Wave 4 default | **Charter-off** for all clients until project manifest / CITDP opt-in. | **Resolved 2026-09-24 refine-plan** |
| W3a MCP surface | **Shipped:** `pseudocode_analyze` + `closure_join_report: true` → shared lib `mcp-server/src/analysis/closure-join-report.ts`. No sibling `tied_closure_join_report`. | **As-built 2026-09-24 W3** |
| W1a MCP mirror | MCP **`tied_gate_check`** (same composition as CLI). | **Shipped (residual R3, 2026-09-25)** |
| Agentstream DAE preflight | **`dae-gate-preflight.ts`** opt-in before first live turn. | **Shipped (residual R3, 2026-09-25)** |
| W5a MCP surface | **Preferred:** extend `tied_validate_consistency` with `ontology_rules: true`. **Fallback:** sibling `tied_validate_ontology` only if consistency handler budget forces split—same rules, one implementation. | **Resolved 2026-09-24 pass 2** |
| W1b discovery inputs | Locked discovery rules in W1b contract (Trackers, open REQ tokens, CITDP draft phase, git branch informational). | **Resolved 2026-09-24 pass 2** |
| W2d CRAP hook | Locked at **`verification-gate`** (optional block after `quality_evidence_collect_manifest`); advisory at **`traceable-commit`** when `crap_block: false`. | **Resolved 2026-09-24 pass 2** |
| `tied agentstream` timing | After **`tiedpreflight`** succeeds; before first live turn when `AGENTSTREAM_DAE_GATE_CHECK=1` or `.tied-yaml.yaml` `dae.agentstream_gate_check: true`. W1 exit does **not** require agentstream wiring. | **Resolved 2026-09-24 pass 2** |
| Child REQ vs single IMPL | **Default:** one parent **REQ-TIED_DAE_INCORPORATION** + single **IMPL-TIED_DAE_INCORPORATION**; each wave enters **`build-plan`** with wave id in invocation remainder. **Wave 4:** sponsor split → child **REQ-TIED_DAE_VERIFICATION_CHARTER** owns charter deliverables; parent remains program coordinator. | **Resolved 2026-09-24 pass 2; child REQ locked 2026-09-24 W4 build-plan** |

**Vocabulary:** PRELOAD `prompt-composer.md`, `tied-methodology.md`, `pseudocode-and-citdp.md`. RECORD **coordinator guide**, **linked plan**, **DAE incorporation wave**, **gate check**, **tied next**, **four-way closure join**, **pseudocode leakage lint**, **express lane**, **handoff-shaped phase YAML**, **build-plan readiness**, **diff-scoped change-risk report** (alias diff-scoped CRAP / upstream CP7), **agentstream gate preflight**, **verification charter**, **mutation cache**, **disjoint verifier**, **gauntlet**. VALIDATE at parent handoff.

**Open for sponsor (non-blocking):** ~~Whether Wave 4 should ever mint **REQ-TIED_DAE_VERIFICATION_CHARTER** vs keeping charter tools under the parent REQ only.~~ **Resolved: child REQ-TIED_DAE_VERIFICATION_CHARTER** (2026-09-24 W4 `build-plan`).

---

## Dependency snapshot (shipped anchors)

| REQ / doc | Role for this program |
| --- | --- |
| [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT](../../tied/requirements/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) | `tied_checklist_gate_validate`, activation collect, adherence reconcile — Wave 0 baseline; **composed by** W1a |
| [REQ-TIED_UNIFIED_TOOLCHAIN](../../tied/requirements/REQ-TIED_UNIFIED_TOOLCHAIN.yaml) | **`tied`** CLI / Node MCP — Wave 1 ergonomics host |
| [REQ-TIED_CLAUDE_HARNESS](../../tied/requirements/REQ-TIED_CLAUDE_HARNESS.yaml) | Dual harness; same gate vocabulary on Claude + Cursor |
| [REQ-TIED_CLAUDE_ADHERENCE_HOOKS](../../tied/requirements/REQ-TIED_CLAUDE_ADHERENCE_HOOKS.yaml) | Tool-attempt telemetry (extend policy in Wave 1+) |
| [REQ-REQUEST_EVIDENCE_ENVELOPE](../../tied/requirements/REQ-REQUEST_EVIDENCE_ENVELOPE.yaml) (if present) / [request-evidence-envelope.md](../../tied/docs/request-evidence-envelope.md) | Envelope v1 close-out packaging; W1c aligns criterion shape without replacing it |
| [checklist-adherence-improvement-plan.md](../../docs/checklist-adherence-improvement-plan.md) | Stages G–O investments |

### Layering rules (all waves)

1. **Compose, do not fork:** New operator surfaces call existing MCP tools (`tied_checklist_gate_validate`, `tied_checklist_activation_collect`, `tied_adherence_reconcile_run`, `request_evidence_envelope_*`, `pseudocode_validate` / `pseudocode_analyze`, `tied_validate_consistency`) and pass through their JSON contracts.
2. **Authoritative Tracker** remains `working/{REQ}/…checklist…yaml` (this folder’s `checklist-tracker.yaml` for the program REQ).
3. **`tied agentstream`** optional DAE gate pre-turn: runs **after** static `tiedpreflight` (valid `.cursor/mcp.json` + `TIED_BASE_PATH`) and **before** the first dispatcher turn when `AGENTSTREAM_DAE_GATE_CHECK=1` or project `.tied-yaml.yaml` sets `dae.agentstream_gate_check: true`. Invokes `tied gate check --phase pre_implementation` for the batch `request_token`. Non-zero exit **2** matches preflight failure semantics (document `-y` / skip flags). Wave 1 **exit** requires CLI/MCP only; agentstream wiring is an optional W1 tail slice.
4. Exit codes: **`0`** = proceed; **`1`** = policy/gate blocked (`allowed: false` or criterion fail); **`2`** = tooling unavailable / misconfiguration (manual path documented).

---

## Delivery waves (summary)

| Wave | Theme | Status | Primary deliverables | Suggested entry | Acceptance (summary) |
| --- | --- | --- | --- | --- | --- |
| **0** | Maintain shipped gates | **closed-maintain** | Regression ownership; coordinator matrix refresh | Doc + existing MCP tests | Gate tools unchanged; guide § adoption snapshot accurate |
| **1** | Adherence ergonomics | **closed** | `tied gate check`; `tied next`; handoff-shaped phase YAML ↔ envelope v1 | **`build-plan`** W1 | Exit contract + operator doc |
| **2** | Quick wins | **closed** | Branch hygiene; leakage lint; express lane; diff-scoped change-risk report | **`build-plan`** W2 | Automated tests for W2a/W2b; template fields for W2c |
| **3** | Validation depth | **closed** | Four-way closure join; mechanical vs judgment doc | **`build-plan`** W3 | Report artifact + guide section |
| **4** | Verification (charter) | **closed** | Mutation cache; hard disjoint verifier; `gauntlet:` | **`build-plan`** W4 + charter | Opt-in only; child **REQ-TIED_DAE_VERIFICATION_CHARTER** |
| **5** | Graph integrity | **Closed** | Ontology rules; charter compliance table | **`build-plan`** W5 | `ontology_rules` + charter compliance hook |

---

## Wave contracts (normative for `build-plan`)

### Wave 0 — maintain shipped gates

| | |
| --- | --- |
| **Entry** | Program PLAN + coordinator guide exist; gate enforcement REQ Active/shipped. |
| **Exit** | Coordinator **Status** column matches shipped tools; Wave 0 disposition = `closed-maintain`; no code change required. |
| **Layers on** | `tied_checklist_gate_validate`, envelope tools, dual harness, `tied agentstream`. |

#### W0a — regression ownership

| Field | Contract |
| --- | --- |
| **INPUT** | List of shipped gate MCP tools + dual-harness smoke paths |
| **OUTPUT** | Short ownership note in this PLAN Artifacts table (maintainers = methodology) |
| **Verification** | Existing MCP/CLI tests for checklist gate enforcement still pass; no new failing suite |
| **Error modes** | N/A (doc); if tests fail → treat as regression under gate REQ, not this program’s Wave 1 |

#### W0b — coordinator adoption snapshot refresh

| Field | Contract |
| --- | --- |
| **INPUT** | Current MCP tool inventory |
| **OUTPUT** | Updated Status cells in coordinator guide § Adoption snapshot |
| **Verification** | Manual cross-check: every **Current** row has a TIED anchor token |

---

### Wave 1 — adherence ergonomics

| | |
| --- | --- |
| **Entry** | Wave 0 exit met; `@tied/cli` umbrella present ([REQ-TIED_UNIFIED_TOOLCHAIN]); Tracker + CITDP paths resolvable for a sample REQ. |
| **Exit** | W1a + W1b ship with RED→GREEN tests; W1c schema + one fixture; operator note in `tied/docs/client-development-index.md`; wave disposition `closed`. |
| **Layers on** | `tied_checklist_gate_validate` (+ optional activation), Tracker dispositions, envelope validate (close-out path unchanged). |

#### W1a — `tied gate check`

| Field | Contract |
| --- | --- |
| **CLI** | `tied gate check --request-token REQ-… --phase pre_implementation\|verification\|close_out [--slug SLUG] [--tracker PATH] [--citdp PATH] [--project-root PATH] [--check-branch]` |
| **MCP (optional mirror)** | Prefer CLI for exit codes; if MCP tool added, name `tied_gate_check` and return `{ allowed, exit_code, receipt_path, reasons[] }` without inventing a second gate algorithm |
| **INPUT** | `request_token`, `phase`, optional `slug`, paths to Tracker + CITDP (default under `working/{REQ}/` + `tied/citdp/`) |
| **Composition** | 1) Load Tracker/CITDP; 2) if `--slug`, assert prior checklist slug disposition ∈ {completed, not_applicable, waived} when gate policy requires prior-slug; 3) CALL `tied_checklist_gate_validate` with same phase/Tracker/CITDP/(activation when depth≥integrated); 4) if `--check-branch`, run W2a algorithm — **hard fail** on mismatch (exit **1**) when gate otherwise allowed |
| **OUTPUT** | stdout JSON summary + human one-liner; persist receipt under `working/{REQ}/gates/` when `receipt_persistence` configured |
| **Exit codes** | `0` iff `allowed: true`; `1` iff `allowed: false`; `2` MCP/server/path misconfig |
| **FAILURE_MODES** | Missing Tracker → exit 2; missing CITDP → exit 2; gate false → exit 1 with `reasons[]`; MCP down → exit 2 + point to `tied/docs/using-tied-without-mcp.md` |
| **Verification** | Unit: composition function with mocked gate result; Composition: CLI → MCP JSON-RPC; Fixture Tracker with `allowed: false` yields exit 1 |

#### W1b — `tied next`

| Field | Contract |
| --- | --- |
| **CLI** | `tied next [--request-token REQ-…] [--project-root PATH]` |
| **INPUT** | `project_root` (default cwd); optional `--request-token` filter |
| **Discovery** | Trackers: `working/*/checklist-tracker.yaml` and `working/**/*checklist*.yaml` under `project_root`, excluding template copies under `tied/docs/`. With `--request-token`, only `working/{TOKEN}/checklist-tracker.yaml` (or single matching `*checklist*` in that folder). |
| **Open REQ tokens** | For each discovered Tracker, read `execution_evidence.request`; include token when any step has `tracking.status` ∈ `{pending, in_progress}` or step `disposition` ∈ `{pending, waived}` with pending tracking. |
| **CITDP drafts** | For each open token, if `tied/citdp/CITDP-{TOKEN}.yaml` exists, include `record_identity.phase` in output when phase ∉ `{closed, close_out}`. |
| **Git (informational)** | `git rev-parse --abbrev-ref HEAD` when inside a repo; emit as `current_branch` in JSON stdout—never used to pick slug. |
| **OUTPUT** | Exactly **one** recommended checklist `slug` + `open_request_tokens[]` + `citdp_phases{}` + rationale string (deterministic: first pending slug in **checklist YAML order** for the selected Tracker) |
| **Exit codes** | `0` when a recommendation is printed; `1` when no open Tracker / no pending slug; `2` misconfig |
| **FAILURE_MODES** | Ambiguous multiple Trackers without `--request-token` → exit 2 with list; empty pending → exit 1 |
| **Verification** | Fixture Tracker with known next slug; golden stdout |

#### W1c — handoff-shaped phase YAML

| Field | Contract |
| --- | --- |
| **Path** | `working/{REQ}/handoffs/{phase}.yaml` (v1 schema) |
| **Schema (minimal)** | `schema_version: 1`, `request_token`, `phase`, `criteria[]` each with `id`, `description`, `verified_by: command\|mcp_tool\|manual`, `evidence: { command?, exit_code?, stdout_hash?, receipt_path? }` |
| **Relation to envelope** | Criteria `id`s SHOULD map to envelope artifact expectations / gate reasons; envelope remains `request_evidence_envelope_*`; W1c does **not** mutate envelope schema |
| **INPUT** | Phase + criterion checklist derived from Tracker gate contract + CITDP success criteria |
| **OUTPUT** | Validated YAML; optional `tied handoff validate --phase …` (may ship as part of W1a or sibling) |
| **Exit / errors** | Invalid schema → exit 1; missing required criterion for phase → exit 1; manual `verified_by` without waiver note → warn (advisory) or fail when `gate_policy` strict |
| **Verification** | Schema fixture + validate rejects missing `verified_by` |

#### Wave 1 — as-built (2026-09-24)

| Slice | Shipped surface | Module / CLI entry | Tests |
| --- | --- | --- | --- |
| **W1a** | `tied gate check` | `mcp-server/src/dae/gate-check-composition.ts`, `mcp-server/src/cli/gate-check.ts`, `@tied/cli` `gate check` | `mcp-server/packages/cli/src/gate-check.test.ts`, `mcp-server/src/e2e/tied-gate-check-cli.test.ts` |
| **W1b** | `tied next` | `mcp-server/src/dae/tied-next.ts`, `mcp-server/src/cli/tied-next.ts` | `mcp-server/packages/cli/src/tied-next.test.ts` |
| **W1c** | `tied handoff validate` | `mcp-server/src/handoff-yaml.ts`, `mcp-server/src/cli/handoff-validate.ts` | `mcp-server/src/handoff-yaml.test.ts` |
| **Not shipped** | MCP `tied_gate_check`; agentstream DAE pre-turn hook | See IMPL `WIRE_AGENTSTREAM_DAE_GATE_PREFLIGHT` | — |

Operator detail: [`tied/docs/client-development-index.md`](../../tied/docs/client-development-index.md) § Adherence ergonomics. Full suite baseline after W0–3: **`npm test` in `mcp-server/` → 1025/1025 pass** (refine pass 3, 2026-09-24; was 1007/1007 at W1 close).

---

### Wave 2 — quick wins

| | |
| --- | --- |
| **Entry** | Wave 1 exit (W1a available for bootstrap hooks). |
| **Exit** | W2a + W2b automated tests green; W2c CITDP template fields documented; W2d optional hook documented (charter threshold). |
| **Layers on** | session-bootstrap / pre-RED checklist text; `pseudocode_validate`; CITDP template; W1a `--check-branch`. |

#### W2a — branch hygiene

| Field | Contract |
| --- | --- |
| **CLI/MCP** | Shared lib used by `tied gate check --check-branch` and optional `tied branch check` |
| **INPUT** | `expected_branch` from CITDP `branch:` or Tracker `execution_evidence.branch` (new optional field); `cwd` git repo |
| **Algorithm** | `git rev-parse --abbrev-ref HEAD`; compare to expected; allow manifest opt-out `dae.branch_check: false` in project `.tied-yaml.yaml` or CITDP `branch_check: skip` |
| **OUTPUT** | `{ ok, current, expected }` |
| **Exit codes** | `0` match or skip; `1` mismatch; `2` not a git repo / git missing |
| **Verification** | Temp git fixture; skip path tested |

#### W2b — pseudocode leakage lint

| Field | Contract |
| --- | --- |
| **Interface** | Extend `pseudocode_validate` (flag `leakage_lint: true` default **on** for new IMPLs) or sibling MCP `pseudocode_leakage_lint` |
| **INPUT** | `essence_pseudocode` text |
| **Rules (v1)** | Flag host syntax tokens (`function `, `=>`, `SELECT `, `http://`, absolute paths `/Users/`, `import `) unless line/block marked `DATA` example or `// leakage-ok:` |
| **OUTPUT** | diagnostics[] with severity `error` (blocking under `gate_mode`) or `warn` |
| **Verification** | Corpus of leaky vs clean sidecars; no false positive on DATA examples |

#### W2c — express lane / CITDP size

| Field | Contract |
| --- | --- |
| **CITDP fields** | `size: XS\|S\|M\|L\|XL`; optional `gate_profile: { front: auto\|bundled, verify: light\|standard\|heavy\|auto }`; `express_lane: true` only when `size: XS` **and** charter allows |
| **INPUT** | CITDP draft at change-definition |
| **OUTPUT** | Documented template + checklist note: XS may skip full ARCH churn **iff** charter allows; still requires `verification-gate` + `tied_validate_consistency` |
| **Hard rule** | Security/billing/auth charter paths **never** default express |
| **Verification** | Schema/doc test; fixture CITDP rejects `express_lane: true` with `size: L` |

#### W2d — diff-scoped change-risk report (upstream CRAP / CP7)

| Field | Contract |
| --- | --- |
| **Hook (primary)** | Checklist slug **`verification-gate`**: optional sub-step **after** successful `quality_evidence_collect_manifest` when CITDP `diff_scoped_crap: true` |
| **Hook (secondary)** | Slug **`traceable-commit`**: advisory warn when threshold exceeded and CITDP `crap_block: false` |
| **Code home** | New module under `mcp-server/src/` (e.g. `diff-scoped-crap.ts`); compose diff paths from git or `tied_plumb_diff_impact_preview` + coverage map; reuse `test_adequacy_validate` **metadata** only (no duplicate adequacy engine) |
| **INPUT** | Diff file set + coverage map; threshold from CITDP `crap_threshold` or `.tied-yaml.yaml` `dae.crap_threshold` |
| **OUTPUT** | Report path `working/{REQ}/evidence/diff-scoped-crap-{timestamp}.json`; warn or block per CITDP |
| **Default** | **off** (`diff_scoped_crap: false`); enable per project/CITDP |
| **Verification** | Fixture diff above threshold → configured fail at verification-gate; warn-only path at traceable-commit |

#### Wave 2 — as-built (2026-09-24)

| Slice | Shipped surface | Module / defaults | Tests |
| --- | --- | --- | --- |
| **W2a** | `tied branch check`; `gate check --check-branch` **hard fail** | `mcp-server/src/dae/branch-check.ts` | `mcp-server/packages/cli/src/branch-check.test.ts` |
| **W2b** | `pseudocode_validate` **`leakage_lint`** (default **on**) | `mcp-server/src/analysis/pseudocode-leakage-lint.ts` | `mcp-server/src/analysis/pseudocode-leakage-lint.test.ts` |
| **W2c** | CITDP `size` / `gate_profile` / `express_lane` validation | `mcp-server/src/citdp-express-lane.ts` (+ `citdp-writer.ts`) | `mcp-server/src/citdp-express-lane.test.ts` |
| **W2d** | Diff-scoped change-risk **library** + post–`quality_evidence_collect_manifest` **hook** when `diff_scoped_crap: true` | `diff-scoped-crap.ts`, `diff-scoped-crap-hook.ts`; default **`diff_scoped_crap: false`** | `diff-scoped-crap.test.ts` + composition (residual R2) |

Fixtures: `working/REQ-TIED_DAE_INCORPORATION/fixtures/pseudocode/{leaky,clean}-sidecar.md`.

---

### Wave 3 — validation depth

| | |
| --- | --- |
| **Entry** | Wave 2 leakage lint available (recommended) or waived. |
| **Exit** | W3a report tool + fixture; W3b doc section in `pseudocode-writing-and-validation.md`. |
| **Layers on** | `pseudocode_analyze`, three-way-alignment checklist slugs, `tied_validate_consistency`. |

#### W3a — four-way closure join

| Field | Contract |
| --- | --- |
| **Interface** | **Preferred:** `pseudocode_analyze` option `closure_join_report: true`. **Fallback:** MCP `tied_closure_join_report` → shared join lib (single algorithm) |
| **INPUT** | REQ token (satisfaction_criteria ids), IMPL token(s), optional test/code path globs from IMPL `code_locations` / `traceability.tests` |
| **Joins** | (1) criterion id → ≥1 IMPL `##` / UPPER_SNAKE block; (2) block → ≥1 test anchor (describe/it or block-lead copy); (3) block → ≥1 code block-lead; (4) orphan blocks → error |
| **OUTPUT** | JSON/Markdown report under `working/{REQ}/evidence/closure-join-{timestamp}.json` |
| **Exit** | MCP `ok: false` when any required join fails under `gate_mode: true` |
| **Verification** | Synthetic REQ/IMPL/test/code fixture with one orphan → fail |

#### W3b — mechanical vs judgment doc split

| Field | Contract |
| --- | --- |
| **OUTPUT** | Section in `tied/docs/pseudocode-writing-and-validation.md`: **Never LLM** (enumeration, inverse, closure, leakage, consistency graph) vs **Always LLM** (domain wording quality, completeness judgment) |
| **Verification** | Doc review checklist in wave close evidence |

#### Wave 3 — as-built (2026-09-24)

| Slice | Shipped surface | Module / MCP args | Tests |
| --- | --- | --- | --- |
| **W3a** | `pseudocode_analyze` + **`closure_join_report: true`** | `mcp-server/src/analysis/closure-join-report.ts`; `persist_closure_report` default **true** → `working/{REQ}/evidence/closure-join-{timestamp}.json` | `mcp-server/src/analysis/closure-join-report.test.ts` (2/2) |
| **W3b** | Mechanical vs LLM judgment doc split | `tied/docs/pseudocode-writing-and-validation.md` § Mechanical checks vs LLM judgment | Doc review in `evidence/wave-3-close-2026-09-24.md` |
| **Not shipped** | Sibling MCP `tied_closure_join_report` | Preferred-path policy honored | — |

---

### Wave 4 — verification charter (optional)

| | |
| --- | --- |
| **Entry** | Sponsor charter flag on project + CITDP `verification_charter: true`. |
| **Exit** | Opt-in tools documented; default clients unchanged. |
| **Layers on** | `verification-gate`, adherence ledger session ids, composition-green. |

#### W4a — diff-scoped mutation cache

| Field | Contract |
| --- | --- |
| **INPUT** | Post-green unit/composition suite; diff paths; cache dir |
| **OUTPUT** | Mutation score + cache manifest; fail verification-gate when score below CITDP threshold |
| **Default** | **off** |

#### W4b — hard disjoint verifier

| Field | Contract |
| --- | --- |
| **Interface** | Policy flag inside `tied_checklist_gate_validate` when CITDP `disjoint_verifier: required` |
| **INPUT** | Adherence ledger implementer `session_id` vs verification-gate runner id |
| **OUTPUT** | `allowed: false` when equal without waiver |
| **Waiver** | CITDP `disjoint_verifier_waiver` with owner + expiry |

#### W4c — gauntlet

| Field | Contract |
| --- | --- |
| **CITDP/IMPL** | Optional `gauntlet:` block listing subjective quality probes |
| **When** | After composition green, before E2E justification |
| **Default** | **off** |

---

### Wave 5 — graph integrity

| | |
| --- | --- |
| **Entry** | Wave 3 mechanical/judgment split documented (recommended). |
| **Exit** | Ontology rules in consistency (or sibling tool) + charter compliance checklist hook. |
| **Layers on** | `tied_validate_consistency`, `author-architecture` slug. |

#### W5a — ontology-style rules

| Field | Contract |
| --- | --- |
| **Interface** | **Preferred:** `tied_validate_consistency` option `ontology_rules: true`. **Fallback:** MCP `tied_validate_ontology` → same rule engine |
| **Rules (v1)** | Inverse depends_on where policy requires; Tarjan SCC on ARCH/IMPL depends; functional one-detail-per-token; disjoint verifier identity when ledger present |
| **OUTPUT** | Structured issues[]; `ok: false` on cycle / duplicate detail |
| **Verification** | Fixture cycle → fail |

#### W5b — charter compliance table

| Field | Contract |
| --- | --- |
| **When** | `author-architecture` / CITDP risk-assessment |
| **INPUT** | Immutable REQ category + project ARCH tokens + change touch set |
| **OUTPUT** | Compliance table artifact; block `gate-pseudocode-validation` if immutable scope touched without new ARCH + human approval evidence |
| **Verification** | Fixture touching immutable without ARCH → block |

---

## Per-wave entry / exit checklist (operators)

| Wave | Enter only if | Exit only if |
| --- | --- | --- |
| 0 | PLAN + guide linked | Snapshot accurate; disposition logged |
| 1 | W0 exit; unified CLI host | W1a exit codes proven; W1b deterministic; W1c schema fixture; client-development-index note |
| 2 | W1a available | W2a/W2b tests; W2c fields in CITDP template docs |
| 3 | build-plan W3 | Closure report + doc section |
| 4 | Charter opt-in | Tools documented; defaults remain off |
| 5 | build-plan W5 | Consistency ontology rules + compliance hook |

Each wave: run `tied_checklist_gate_validate` phase `pre_implementation` before RED; `verification` + `close_out` before claiming wave closed; `tied_validate_consistency` after any TIED YAML mutation.

---

## Ready for `build-plan`

**Program complete (2026-09-24–25):** Waves **0–5 closed**; parent **machine close-out** — [evidence/close-out-receipt-2026-09-24.md](./evidence/close-out-receipt-2026-09-24.md) (commit `b4636f8`). Post-close-out residual **R1–R3** closed per [RESIDUAL-PLAN.md](./RESIDUAL-PLAN.md). **No further `build-plan` on DAE waves** except regression fixes or sponsor reopen.

**Verification baseline (program):** `cd mcp-server && npm run build && npm test` → **1058+** (2026-09-25 after methodology boundary + residual). Gate regression subset (Wave 0): checklist-gate MCP bundle (see Artifacts table).

### Traceability policy (REQ / IMPL)

| Policy | Rule |
| --- | --- |
| **Parent REQ** | **REQ-TIED_DAE_INCORPORATION** remains the program owner for all waves unless sponsor splits W4 charter tooling into a child REQ. |
| **IMPL** | Single **IMPL-TIED_DAE_INCORPORATION**; wave work maps to existing Active procedures—no per-wave IMPL proliferation by default. |
| **Tracker** | Program copy stays at `working/REQ-TIED_DAE_INCORPORATION/checklist-tracker.yaml`; per-wave **`build-plan`** may use a wave-scoped copy under `working/REQ-TIED_DAE_INCORPORATION/waves/w{N}/checklist-tracker.yaml` when isolation helps gate receipts. |
| **CITDP** | Program CITDP describes the whole program; wave **`build-plan`** may attach wave-specific success criteria in CITDP `impact_analysis.phased_rollout` notes without forking the record. |

### Prerequisites per wave (before RED)

| Wave | Enter `build-plan` only if | First composition target |
| --- | --- | --- |
| **0–3** | **Closed** — disposition log + as-built tables above | Regression-only unless LEAP fix |
| **4–5** | **Closed** — see disposition log | Regression-only unless LEAP fix |

### First RED test file paths

W0–5 paths **shipped** (green). Residual R2–R3 added `diff-scoped-crap-hook`, `tied-gate-check-mcp`, `tied-cli-bundled-methodology-pilot` (methodology boundary program — separate REQ).

| Slice | Test file | Status |
| --- | --- | --- |
| W1a | `mcp-server/packages/cli/src/gate-check.test.ts` | **shipped** |
| W1a (composition) | `mcp-server/src/e2e/tied-gate-check-cli.test.ts` | **shipped** |
| W1b | `mcp-server/packages/cli/src/tied-next.test.ts` | **shipped** |
| W1c | `mcp-server/src/handoff-yaml.test.ts` | **shipped** |
| W2a | `mcp-server/packages/cli/src/branch-check.test.ts` | **shipped** |
| W2b | `mcp-server/src/analysis/pseudocode-leakage-lint.test.ts` | **shipped** |
| W2c | `mcp-server/src/citdp-express-lane.test.ts` | **shipped** |
| W2d | `mcp-server/src/diff-scoped-crap.test.ts` | **shipped** (+ post-manifest hook — R2; **RISK-DAE-009** closed) |
| W3a | `mcp-server/src/analysis/closure-join-report.test.ts` | **shipped** |
| W4a | `mcp-server/src/mutation-cache.test.ts` | **shipped** — cache miss + score below threshold |
| W4b | `mcp-server/src/checklist-validator.test.ts` + `mcp-server/src/dae/charter-verification.test.ts` | **shipped** — equal session ids → `allowed: false` when `disjoint_verifier: required` |
| W4c | `mcp-server/src/gauntlet-runner.test.ts` | **shipped** — optional `gauntlet:` block parsing |
| W5a | `mcp-server/src/ontology-rules.test.ts` | **shipped** — RED: ARCH cycle fixture → `ok: false` via `ontology_rules: true` |
| W5b | `mcp-server/src/charter-compliance-table.test.ts` | **shipped** — immutable REQ touch without ARCH → gate block |

### Program fixtures (`working/REQ-TIED_DAE_INCORPORATION/fixtures/`)

| Fixture | Purpose |
| --- | --- |
| `fixtures/trackers/gate-blocked-minimal.yaml` | W1a exit **1** when gate returns `allowed: false` |
| `fixtures/trackers/next-slug-pending.yaml` | W1b golden `slug` (first pending in order) |
| `fixtures/citdp/w1-gate-check-minimal.yaml` | Minimal CITDP body for gate-check composition tests |
| `fixtures/handoffs/pre_implementation.v1.yaml` | W1c schema v1 valid sample |
| `fixtures/pseudocode/leaky-sidecar.md` / `clean-sidecar.md` | W2b leakage corpus seeds |

**W4–5 fixtures (on disk):**

| Fixture | Purpose |
| --- | --- |
| `fixtures/charter/verification-charter-minimal.yaml` | CITDP body with `verification_charter: true` for W4 gate tests |
| `fixtures/ledger/disjoint-verifier-mismatch.json` | W4b adherence ledger with matching implementer/verifier session ids |
| `fixtures/graph/arch-cycle-minimal.yaml` | W5a ontology / depends_on cycle |
| `fixtures/charter/immutable-req-touch.yaml` | W5b compliance table block scenario |

Wave **`build-plan`** copies or references these paths; do not mutate program Tracker fixtures in place during tests (use temp dirs).

---

## Wave disposition log

| Wave | Disposition | Date | Evidence |
| --- | --- | --- | --- |
| 0 | **closed-maintain** | 2026-09-24 | Coordinator § Adoption snapshot refresh (Current rows + anchors); gate regression suites 23/23 pass (`checklist-gate-mcp`, activation-collect, gate-evidence-hydration, gate-receipt, verify); `working/REQ-TIED_DAE_INCORPORATION/evidence/wave-0-close-2026-09-24.md` |
| 1 | **closed** | 2026-09-24 | W1a–c as-built § Wave 1; full suite **1007/1007** at W1 close → **1025/1025** pass 3; **R3** added MCP mirror + agentstream preflight (2026-09-25) |
| 2 | **closed** | 2026-09-24 (+ R2 2026-09-25) | W2 as-built § Wave 2; **R2** closed **RISK-DAE-009** (post-manifest hook) |
| 3 | **closed** | 2026-09-24 | W3 as-built § Wave 3; `evidence/wave-3-close-2026-09-24.md`; preferred `pseudocode_analyze` path only |
| 4 | **closed** | 2026-09-24 | Child **REQ-TIED_DAE_VERIFICATION_CHARTER**; modules `mutation-cache.ts`, `disjoint-verifier.ts`, `gauntlet-runner.ts`; fixtures `fixtures/charter/*`, `fixtures/ledger/disjoint-verifier-mismatch.json`; `client-development-index` § Verification charter |
| 5 | **closed** | 2026-09-24 | W5a `ontology_rules` on `tied_validate_consistency`; W5b charter compliance hook; `evidence/wave-5-close-2026-09-24.md`; full suite **1036/1036** |

---

## Test strategy (program-level)

| Layer | Approach |
| --- | --- |
| **Doc split / refine** | Manual: guide ↔ PLAN ↔ tied-vs cross-links; no duplicated acceptance tables in guide |
| **Wave 1+** | Strict TDD on `@tied/cli` / MCP composition modules; composition tests for CLI → MCP JSON-RPC |
| **Verification** | Per-wave `tied_checklist_gate_validate` at `verification` and `close_out`; `tied_validate_consistency` after YAML changes; `pseudocode_validate` when IMPL sidecars change |
| **Charter tools (W4)** | Opt-in project manifest; proof under `working/{REQ}/evidence/` |
| **Refine pass 3 (2026-09-24)** | Reconcile PLAN/CITDP to W0–3 as-built; W4–5 shipped same program window |

### Program test matrix (as-built)

| Test / check | Wave | Testability | Test path (if automated) |
| --- | --- | --- | --- |
| Cross-link audit PLAN↔guide↔tied-vs | 0 | manual | — |
| Gate MCP regression bundle | 0 | **automated** | `mcp-server/dist/tools/checklist-gate-mcp.test.js` (+ 4 sibling gate tests, 23 total) |
| `tied gate check` exit 0/1/2 | 1a | **automated** | `packages/cli/src/gate-check.test.ts`, `src/e2e/tied-gate-check-cli.test.ts` |
| `tied next` golden slug | 1b | **automated** | `packages/cli/src/tied-next.test.ts` |
| Handoff YAML schema | 1c | **automated** | `src/handoff-yaml.test.ts` |
| Branch mismatch (hard fail) | 2a | **automated** | `packages/cli/src/branch-check.test.ts` |
| Leakage lint corpus | 2b | **automated** | `src/analysis/pseudocode-leakage-lint.test.ts` |
| Express lane field validation | 2c | **automated** | `src/citdp-express-lane.test.ts` |
| Diff-scoped change-risk threshold | 2d | **automated** | `src/diff-scoped-crap.test.ts` |
| Closure join orphan | 3a | **automated** | `src/analysis/closure-join-report.test.ts` |
| Full mcp-server suite | 0–5 + residual | **automated** | `npm test` in `mcp-server/` (1058+ tests, 2026-09-25) |
| Mutation cache / disjoint / gauntlet | 4 | **automated** | See First RED table |
| Ontology cycle / charter table | 5 | **automated** | See First RED table |

---

## Risks

| ID | Risk | Severity | Likelihood | Mitigation |
| --- | --- | --- | --- | --- |
| RISK-DAE-001 | Scope creep into full DAE plugin port | High | Medium | Non-goals + coordinator “what not to copy” |
| RISK-DAE-002 | Duplicate gate surfaces (Python + Node) | High | Low | ARCH: centralized Node MCP only in methodology repo |
| RISK-DAE-003 | Heavy W4 tools block small clients | Medium | Medium | Charter flags; express lane for XS; defaults off |
| RISK-DAE-004 | Comparison docs drift from PLAN | Medium | Medium | Coordinator role banner; disposition log here |
| RISK-DAE-005 | W1a forks gate algorithm | High | Low | Contract: must CALL `tied_checklist_gate_validate` unchanged |
| RISK-DAE-006 | Handoff YAML replaces envelope | Medium | Low | W1c additive-only resolution |
| RISK-DAE-007 | Ambiguous MCP tool naming at W3/W5 | Low | Medium | Pass 2 preferred extend-vs-sibling policy; one join/ontology engine |
| RISK-DAE-008 | Agentstream gate preflight loops or blocks CI | Medium | Low | Opt-in env/manifest; exit 2 documents skip flags; W1 exit without agentstream |
| RISK-DAE-009 | ~~W2d hook not auto-invoked~~ | — | — | **Closed R2** — `diff-scoped-crap-hook.ts` after manifest when enabled |
| RISK-DAE-010 | ~~MCP mirrors / agentstream preflight~~ | — | — | **Closed R3** — `tied_gate_check` + `dae-gate-preflight`; `tied_closure_join_report` mirror still deferred |

**Blast radius (program):** `mcp-server` gate/CLI packages, `@tied/cli`, CITDP template/docs, `pseudocode_*` tools, `docs/comparisons/*`, optional verification-gate plugins. **Unchanged:** token graph semantics, IMPL-as-logic, dual-harness gate vocabulary.

**Phased rollout:** Wave 0 maintain → W1 ergonomics → W2 quick wins → W3 validation depth → W4 charter-optional → W5 graph integrity. No wave skips entry criteria.

---

## Program close-out (2026-09-24–25)

All waves **0–5 closed** on disposition log. Wave 4 delivered under child **[REQ-TIED_DAE_VERIFICATION_CHARTER](../../tied/requirements/REQ-TIED_DAE_VERIFICATION_CHARTER.yaml)** (charter-off by default). Residual **R1–R4** closed — [RESIDUAL-PLAN.md](./RESIDUAL-PLAN.md) (R4 = [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY](../../tied/requirements/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml)).

| Item | Status |
| --- | --- |
| Machine close-out | Parent + charter + methodology boundary receipts under respective `working/*/evidence/` |
| Test baseline | `mcp-server` npm test (**1058+**, 2026-09-25) |
| Residual | **R1–R3** closed (2026-09-25); **R4** methodology boundary **Implemented** |
| Vocabulary | Prose: **diff-scoped change-risk report**; stable ids: `diff_scoped_crap`, `diff-scoped-crap.v1` |
| Private docs | `docs/comparisons/` gitignored — refresh locally when gate tooling changes |

---

## Artifacts

| Artifact | Path |
| --- | --- |
| Linked plan | `working/REQ-TIED_DAE_INCORPORATION/PLAN.md` (this file) |
| Coordinator guide (local) | `docs/comparisons/dae-mechanisms-for-tied-improvement.md` (gitignored) |
| Comparison reference (local) | `docs/comparisons/tied-vs-disciplined-agentic-engineering.md` (gitignored) |
| CITDP | `tied/citdp/CITDP-REQ-TIED_DAE_INCORPORATION.yaml` (`phase: closed`) |
| Residual plan | `working/REQ-TIED_DAE_INCORPORATION/RESIDUAL-PLAN.md` |
| Tracker | `working/REQ-TIED_DAE_INCORPORATION/checklist-tracker.yaml` |
| Wave 0 ownership | Methodology maintainers — gate + dual harness regression: `mcp-server/dist/tools/checklist-gate-mcp.test.js`, `checklist-activation-collect.test.js`, `checklist-gate-evidence-hydration.test.js`, `gate-receipt.test.js`, `verify.test.js` (23 tests, 2026-09-24); agentstream parity/adherence under `packages/agentstream/` on full `npm test` |
| Program fixtures | `working/REQ-TIED_DAE_INCORPORATION/fixtures/` (see Ready for build-plan) |
| Pass 2 refine evidence | `working/REQ-TIED_DAE_INCORPORATION/evidence/refine-plan-2026-09-24-pass2.md` |
| Pass 3 refine evidence | `working/REQ-TIED_DAE_INCORPORATION/evidence/refine-plan-2026-09-24-pass3.md` |
