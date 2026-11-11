# agentstream (canonical)

**Scope:** **`tied agentstream`** / **`@tied/agentstream`** (TypeScript, Phase **4d** default): configuration, pipeline turn assembly, text sources, feature-spec batch, TDD/checklist YAML rendering, session chaining, executor, non-compact HTML, checklist control trailer, and optional TIED MCP preflight. Legacy Go tree removed — see [`../../mcp-server/packages/agentstream/README.md`](../../mcp-server/packages/agentstream/README.md). **Vocabulary only** — historical Go terms may appear in `IMPL-GOAGENT-*` sidecars.

**Traceability:** [REQ-GOAGENT-LIB-MODULE](../requirements/REQ-GOAGENT-LIB-MODULE.yaml) · [REQ-GOAGENT-CLI-CONFIG](../requirements/REQ-GOAGENT-CLI-CONFIG.yaml) · [REQ-GOAGENT-TEXT-SOURCES](../requirements/REQ-GOAGENT-TEXT-SOURCES.yaml) · [REQ-GOAGENT-FEATURESPEC-BATCH](../requirements/REQ-GOAGENT-FEATURESPEC-BATCH.yaml) · [REQ-GOAGENT-YAML-STEP-RENDER](../requirements/REQ-GOAGENT-YAML-STEP-RENDER.yaml) · [REQ-GOAGENT-PIPELINE-CHAIN](../requirements/REQ-GOAGENT-PIPELINE-CHAIN.yaml) · [REQ-GOAGENT-AGENT-EXECUTOR](../requirements/REQ-GOAGENT-AGENT-EXECUTOR.yaml) · [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT](../requirements/REQ-GOAGENT-NON-COMPACT-HTML-FORMAT.yaml) · [REQ-GOAGENT-CHECKLIST-CONTROL](../requirements/REQ-GOAGENT-CHECKLIST-CONTROL.yaml)

**See also:** [`domain-references.md`](domain-references.md) · [`agent-stream-ruby.md`](agent-stream-ruby.md) · [`tied-methodology.md`](tied-methodology.md) · [`pseudocode-and-citdp.md`](pseudocode-and-citdp.md) · [`../../mcp-server/packages/agentstream/README.md`](../../mcp-server/packages/agentstream/README.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **`tied agentstream`** / **@tied/agentstream** | go agent, go runner, `tools/agentstream` (alone) | Operator CLI; implementation in `mcp-server/packages/agentstream/` |
| **Turn** | prompt, message (alone) | Struct: `Parts []string`, `ChainFromPrevious bool` |
| **ChainFromPrevious** | resume flag on turn | `true` → effective `--resume`; `false` → new session |
| **lead checklist** | agent checklist, REQ checklist | YAML from `--lead-checklist-yaml`; default `tied-bundle/docs/agent-req-implementation-checklist.yaml` |
| **feature-spec batch** | batch yaml, -b file | `--feature-spec-batch-yaml`; breaks session chain per record |
| **pipeline Build** | build turns | `pipeline.Build` — fixed source order |
| **ParseAndResolve** | parse argv | Entry config resolution in `config` package |
| **dry-run** | preview run | `-d` / `--dry-run`; prints argv per turn, no subprocess |
| **agentstream_control** | control json | Explicit fenced JSON schema for checklist routing ([REQ-GOAGENT-CHECKLIST-CONTROL](../requirements/REQ-GOAGENT-CHECKLIST-CONTROL.yaml)) |
| **Authoritative Tracker** | copied checklist, completion list | Persisted per-request `checklist-tracker.v1` state supplied to the checklist evidence gate; distinct from the read-only checklist definition and from a synthetic projection |
| **Tracker completion receipt** | completion prose, successful turn | Strict fenced `agentstream_tracker` JSON emitted for the current `StepStub`; carries one disposition and its evidence contract |
| **Tracker writer** | checklist updater, status writer | Agentstream component that validates one Tracker completion receipt and atomically updates the explicit per-request Tracker without mutating the checklist definition |
| **`--checklist-tracker-yaml`** | checklist state path | Writable per-request Authoritative Tracker path; distinct from read-only `--lead-checklist-yaml` definition |
| **`--resume-from-tracker`** | tracker resume, durable controller | With `--checklist-tracker-yaml`, derives `--first-turn` from pending step dispositions; optional `--session-id` from latest `state_history` ([REQ-TIED_DURABLE_CHECKLIST_CONTROLLER](../requirements/REQ-TIED_DURABLE_CHECKLIST_CONTROLLER.yaml), REQ-CTRL-007) |
| **Adherence ledger** | adherence events, event log | Append-only `agent-adherence-event.v1` JSONL under `working/{REQ-TOKEN}/adherence/`; hash/reference edges for six lifecycle event classes; distinct from **evidence chain profile** |
| **`--adherence-ledger`** | adherence path | Writable adherence ledger path; defaults to `working/{REQ-TOKEN}/adherence/events.jsonl` (Stage G committed) |
| **instruction binding** | nonce binding, instruction hash | Per-turn `instruction_nonce` + `instruction_hash` issued before subprocess; receipt must match both |
| **evidence ref resolution** | resolve evidence refs, RESOLVE_EVIDENCE_REFS | Machine verification of each `evidence_refs[]` entry for `completed` dispositions before Tracker write; implements `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` block `RESOLVE_EVIDENCE_REFS` |
| **resolved evidence ref** | verified ref, artifact hash edge | Successfully resolved ref with `ref`, `kind` (`file_path` \| `manifest_ref` \| `command_evidence`), and `artifact_hash`; input to `outcome_verified` ledger rows |
| **generic prose ref** | prose evidence, self-reported success | Non-path evidence string (e.g. "tests passed", "build ok") rejected with `unresolved_evidence_ref` |
| **manifest ref** | verification manifest path | `evidence_refs[]` entry pointing to `verification-evidence-manifest.v1`; all command exit codes must be zero |
| **outcome_verified event** | verified outcome, evidence verified | Adherence ledger `event_class` appended after successful evidence ref resolution; records `artifact_ref` + `artifact_hash` |
| **adherence event class** | lifecycle stage, event type | One of six non-interchangeable classes: `instruction_rendered`, `agent_acknowledged`, `action_attempted`, `outcome_verified`, `gate_decided`, `status_mutated` |
| **adherence reconciliation** | reconcile report, adherence audit | Read-only report emitting finding codes (`rendered_without_acknowledgment`, etc.); never mutates Tracker or TIED YAML |
| **reconcile operator surface** | reconcile CLI, reconcile MCP | Read-only `ReconcileReport` via **`tied agentstream`** / **`@tied/agentstream`**; MCP **`tied_adherence_reconcile_run`** uses the same TypeScript implementation |
| **active-turn marker** | turn marker, subprocess marker | Short-lived `active-turn-marker.v1` JSON at `working/{REQ-TOKEN}/adherence/active-turn.json`; written after `instruction_rendered`, cleared after turn handler; hooks read for ledger correlation |
| **append-only bridge** | hook bridge, adherence hook bridge | Cursor: `mcp-server/dist/cli/adherence-append-action-attempted.js` via `.cursor/hooks/log.rb`. Claude: `mcp-server/dist/cli/claude-adherence-bridge.js` via bootstrap-merged `.claude/settings.json` `PostToolUse` **Node command** (legacy `.sh`/`.cmd` wrappers are optional; Windows must not register `.sh` in settings). Both append `action_attempted` fail-silent when marker absent. [REQ-TIED_CLAUDE_ADHERENCE_HOOKS](../requirements/REQ-TIED_CLAUDE_ADHERENCE_HOOKS.yaml) |
| **hook_log_ref** | hook yaml pointer | Ledger `{ path, line }` pointer into hook YAML logs; never inlines prompt, tool payloads, or shell output |
| **PreviewTrackerMigration** | tracker migration preview, slug diff preview | Read-only `tracker-migration-preview.v1` report comparing checklist definition slug inventory to an existing Tracker; flags stale dispositions; CLI `--checklist-tracker-preview`; never mutates Tracker bytes |
| **run-feature-batch-agentstream** | tasd (alone) | Shell driver: `scripts/run-feature-batch-agentstream.sh` |
| **run-traditional-four-phase-agentstream** | WF four-phase wrapper | Shell driver: `scripts/run-traditional-four-phase-agentstream.sh` — feature-spec batch only (no default lead checklist); `MODEL_SLUG` → `--model`; expands `{{MODEL_*}}` / `{{FEATURE_REMAINDER}}` in [traditional-four-phase-agentstream.yaml](../../docs/demos/traditional-four-phase-agentstream.yaml) |
| **traditional four-phase batch** | WF agentstream yaml | `docs/demos/traditional-four-phase-agentstream.yaml` — four ordered records (`add-feature` → `refine-plan` → `build-plan` → `close-out`); `chainFromPrevious: false` per record via feature-spec loader |
| **harness profile** | agent path harness, claude path flag | Explicit executor selection: `cursor` (default), `claude` (fixture-gated **AgentDriver**), `dry-run`; distinct from **`--agent-path`** (Cursor executable override only). [REQ-TIED_CLAUDE_HARNESS](../requirements/REQ-TIED_CLAUDE_HARNESS.yaml) |
| **`--harness claude`** | `--agent-path claude` | Selects Claude Code **AgentDriver** after subprocess/stream fixtures pass; **not** a synonym for `--agent-path`. |
| **AgentDriver** | harness adapter, Claude executor wrapper | Interface boundary for one harness: launch subprocess, parse stream, expose session id / permissions / env, emit shared receipt shape. Cursor wraps existing `live-executor`/`executor-run`; Claude is a new module. Live Claude path owned by [REQ-TIED_CLAUDE_LIVE_DRIVER](../requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml) (`related_to` closed [REQ-TIED_CLAUDE_HARNESS](../requirements/REQ-TIED_CLAUDE_HARNESS.yaml)). Windows CI / symlink / skills re-root / comparison-doc refresh owned by [REQ-TIED_CLAUDE_BOOTSTRAP_OPS](../requirements/REQ-TIED_CLAUDE_BOOTSTRAP_OPS.yaml) (not AgentDriver). |
| **Claude stream oracle** | Claude fixture, frozen NDJSON | Version-pinned frozen stream/session files under `mcp-server/packages/agentstream/fixtures/claude/`; separate from Cursor oracles; gates live checklist enablement. [REQ-TIED_CLAUDE_LIVE_DRIVER](../requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml) |
| **fixture-gated live checklist** | live Claude CI, unpinned live run | Operator live `tied agentstream --harness claude` allowed only after parser/session/harness composition fixtures pass; no live Claude subprocess required in CI initially. [REQ-TIED_CLAUDE_LIVE_DRIVER](../requirements/REQ-TIED_CLAUDE_LIVE_DRIVER.yaml) |
| **dry vs live table** | live parity table | README operator table distinguishing `--harness claude` dry-run placeholder from fixture-gated live AgentDriver; CI remains fixture-only. |
| **dual-harness wf-03 parity smoke** | wf03 smoke | `scripts/dual-harness-wf03-parity-smoke.sh --dry-run-only` — CI argv/MCP guard; manual live compares gold fingerprint (`1793760220-wf-agentstream-wf-03`). [REQ-AGENTSTREAM_CLAUDE_WF_PARITY](../requirements/REQ-AGENTSTREAM_CLAUDE_WF_PARITY.yaml) |
| **`{{SKILL_ROOT}}` batch placeholder** | skill root expansion | Expanded by `run-traditional-four-phase-agentstream.sh`: `.claude/skills` when `HARNESS=claude`, else `.cursor/skills`. [REQ-AGENTSTREAM_CLAUDE_WF_PARITY](../requirements/REQ-AGENTSTREAM_CLAUDE_WF_PARITY.yaml) |
| **harness turn trace** | AGENTSTREAM_HARNESS_TRACE | Optional JSONL `harness-turn-trace.v1` per live turn when `AGENTSTREAM_HARNESS_TRACE=1`. [REQ-AGENTSTREAM_CLAUDE_WF_PARITY](../requirements/REQ-AGENTSTREAM_CLAUDE_WF_PARITY.yaml) |
| **workflow-trial disposable tag** | fair comparison client id, epoch tag | `--tag` passed to `new-tied-client.mjs` from **`workflow-trial-agentstream.sh`**: `wf-agentstream-{wf-id}-{harness}-{modelBucket}`; full dirname `{epoch}-{tag}`. **modelBucket:** MODEL_CONFIG first, else MODEL_SLUG; lowercase; strip `.` and `-`; append normalized **`MODEL_EFFORT`** when set. [REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG](../requirements/REQ-WF_TRIAL_AGENTSTREAM_DISPOSABLE_TAG.yaml) · [REQ-WF_TRIAL_MODEL_EFFORT](../requirements/REQ-WF_TRIAL_MODEL_EFFORT.yaml) |
| **model effort** | `MODEL_EFFORT`, `output_config.effort` | Operator level `low`…`max` for WF matrix batches: **`workflow_trial_range`** 4th positional (or `-`); propagates to manifest, four-phase batch. Claude: **`--effort`** + `CLAUDE_CODE_EFFORT_LEVEL`. Cursor: agentstream rewrites **`--model`** catalog slug tier (`-medium-fast`, `-thinking-high`; not `[effort=]`); Grok **4.5/4.6** → `cursor-grok-*`, **4.7+** → `grok-*`; `composer-2.5*` ignored + DIAGNOSTIC. Shell: **`wf_trial_canonicalize_cursor_model_slug`**, **`tools/bootstrap/lib/cursor-catalog-model-slug.mjs`**. Opt-out **`AGENTSTREAM_CURSOR_MODEL_BRACKET_EFFORT=0`**. Default **`--approve-mcps`** + **`--add-dir`**. [REQ-WF_TRIAL_MODEL_EFFORT](../requirements/REQ-WF_TRIAL_MODEL_EFFORT.yaml) |
| **workflow-trial orchestrator operator help** | styled help, no-args help | **`workflow_trial_agentstream`** with no args or `--help` prints a styled operator screen (stderr default; `TIED_CLI_HELP_STDOUT=1` or `--stdout`) before bootstrap — see **`scripts/lib/wf-trial-agentstream-help.inc.sh`**. [REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP](../requirements/REQ-WF_TRIAL_AGENTSTREAM_OPERATOR_HELP.yaml) |
| **WF trial model spec** | config id, registry | **`docs/demos/wf-trial-model-specs.yaml`** (schema **v2**) maps matrix **`CONFIG_ID`** → `MODEL_CONFIG` + harness `MODEL_SLUG`; **`compose:`** families (`luna`, `grok47`, `sol`, `composer-2.5`). Resolver: **`tools/bootstrap/lib/wf-trial-model-spec.mjs`**, **`scripts/lib/wf-trial-model-spec.inc.sh`**. [REQ-WF_TRIAL_MODEL_SPEC_CLI](../requirements/REQ-WF_TRIAL_MODEL_SPEC_CLI.yaml) · [REQ-WF_TRIAL_MODEL_COMPOSE](../requirements/REQ-WF_TRIAL_MODEL_COMPOSE.yaml) |
| **WF trial model catalog** | model ref, catalog snapshot | **`docs/demos/wf-trial-model-catalog.yaml`** — all `agent models` / Claude API ids; **`resolve-ref`** after alias, compose, matrix + aliases. Regen: **`node tools/bootstrap/sync-wf-trial-model-catalog.mjs`**. [REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE](../requirements/REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE.yaml) |
| **workflow_trial_range** | WF batch shell helper | In **`scripts/build-commands.sh`**: `workflow_trial_range HARNESS MODEL_REF EFFORT END START` — `wf_trial_resolve_model_ref` passes **EFFORT** into Node before `MODEL_EFFORT`; canonical Cursor form **`cursor luna medium`**. Tiered id + mismatched effort fails. DIAGNOSTIC when cursor + `composer-2.5*` + effort. Haiku on Claude: **`haiku-5-5`**. [REQ-WF_TRIAL_MODEL_COMPOSE](../requirements/REQ-WF_TRIAL_MODEL_COMPOSE.yaml) |
| **traditional WF prompts** | PROMPT-WF catalog | **`docs/demos/catalog-traditional-workflow-trial-prompts.md`**: **WF-01…08** (unit-focused) · **WF-09** (**goal-first** paste) · **WF-10…12** (**goal-first-soc** paste — resource/I/O contract stress; composition graded from PLAN/tests). Orchestrator: **`workflow_trial_agentstream wf-NN`** for **NN 01–12**. [REQ-WF_TRIAL_COMPOSITION_PROMPTS](../requirements/REQ-WF_TRIAL_COMPOSITION_PROMPTS.yaml) · [REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS](../requirements/REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS.yaml) · [REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS](../requirements/REQ-WF_TRIAL_COMPOSITION_SOC_PROMPTS.yaml) |
| **WF trial phase handoff** | phase-handoff artifact, cold session bridge | Markdown under `working/{REQ}/evidence/phase-handoff-{skill}.md` linking RESOLVE, gates, and next skill; mitigates `chainFromPrevious: false` in traditional four-phase batch. [REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../requirements/REQ-WF_TRIAL_FOUR_PHASE_HARDENING.yaml) |
| **WF trial reconcile preflight** | MCP dist preflight, reconcile readiness | Orchestrator DIAGNOSTIC when store `mcp-server/dist` missing before close-out reconcile; optional `WF_TRIAL_STRICT_RECONCILE`. [REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../requirements/REQ-WF_TRIAL_FOUR_PHASE_HARDENING.yaml) |
| **disposable preload contract** | agent-preload-contract on disposable | `tied-project/agent-preload-contract.yaml` materialized at WF disposable bootstrap (copy-if-absent from bundle template) so preload resolver does not fall back to bundle template only. [REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../requirements/REQ-WF_TRIAL_FOUR_PHASE_HARDENING.yaml) |
| **WF_TRIAL_SKIP_RECONCILE_PREFLIGHT** | skip reconcile preflight | When set, orchestrator skips MCP dist check before four-phase live run. [REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../requirements/REQ-WF_TRIAL_FOUR_PHASE_HARDENING.yaml) |
| **WF_TRIAL_STRICT_RECONCILE** | strict reconcile preflight | When set, missing `mcp-server/dist/index.js` fails orchestrator before batch (default off). [REQ-WF_TRIAL_FOUR_PHASE_HARDENING](../requirements/REQ-WF_TRIAL_FOUR_PHASE_HARDENING.yaml) |
| **WF03 Claude incomplete cell** | live matrix gap, haiku55 incomplete | Facilitator label when a Claude wf-03 disposable run reaches GREEN tests but fails machine **`close_out`** or Claude preflight validation (example client `1793810114-wf-agentstream-wf-03-claude-claudehaiku55`). Distinct from **WF03_CURSOR_GOLD**. Follow-on: [REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS](../requirements/REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS.yaml) · [PLAN](../working/REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS/PLAN.md). |
| **WF trial strict preflight** | `WF_TRIAL_STRICT_PREFLIGHT` | When set, **`workflow-trial-agentstream.sh`** should fail closed if `run-tied-claude-client-validation.mjs` reports `ok: false` (proposed in REQ-CLAUDE_WF03_LIVE_MATRIX_GAPS refine-plan). Default today: DIAGNOSTIC and continue. |
| **WF trial orchestrator process log** | wf-trial-orchestrator-run, process.stdout.log | Default-on tee of orchestrator stdout/stderr under `tied-project/working/wf-trial-orchestrator-run/evidence/` with manifest **`wf-trial-orchestrator-run.v1.json`**. **`WF_TRIAL_SKIP_PROCESS_LOG=1`** disables. Distinct from **`AGENTSTREAM_HARNESS_TRACE`**. [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG](../requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml) |
| **WF_TRIAL_SKIP_PROCESS_LOG** | skip orchestrator process log | When set, **`workflow-trial-agentstream.sh`** does not write process log files or manifest. [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG](../requirements/REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG.yaml) |
| **WF trial implementation stack** | TypeScript matrix stack, wf-trial stack | Orchestrator-enforced **TypeScript + ESM + `node --import tsx --test`** on disposable WF clients: fixture seed, **`wf-trial-agent-preload-contract.yaml`**, batch refine “Locked stack” table. Stack id **`wf-trial-ts-node-test-v1`**. [REQ-WF_TRIAL_IMPLEMENTATION_STACK](../requirements/REQ-WF_TRIAL_IMPLEMENTATION_STACK.yaml) |
| **implementation_stack_id** | stack id, cohort filter | String in `trial-workflow-interaction-inventory.v1.json` (e.g. `wf-trial-ts-node-test-v1`); bump when runner or layout contract changes. |
| **tied-methodology-version.session.v1** | session semver evidence | JSON under `tied-project/working/{REQ-TOKEN}/evidence/`; captured via MCP `server_info` on turn 1 ([REQ-TRIAL_METHODOLOGY_VERSION_READOUT](../requirements/REQ-TRIAL_METHODOLOGY_VERSION_READOUT.yaml)); consumed by `@record-wf-trial`. |
| **tied_methodology_version** | inventory semver mirror | Optional top-level field on `trial-workflow-interaction-inventory.v1.json` mirroring session evidence. |
| **WF_TRIAL_SKIP_IMPLEMENTATION_STACK** | skip stack seed | When set, **`workflow-trial-agentstream.sh`** skips TypeScript fixture seed and WF-specific preload materialize; matrix comparability waived. See same PLAN. |

---

## Bounded composition (client-owned driver)

| Concept | Symbol / block | Notes |
|---------|----------------|-------|
| Client-owned AgentDriver seam | `BIND_CLIENT_AGENT_DRIVER` | Injectable driver factory; built-in `cursor`, `claude`, `dry_run` unchanged; external executors require OEE ref (C2 deferral). `[REQ-TIED_BOUNDED_COMPOSITION]` `[IMPL-TIED_BOUNDED_AGENTSTREAM_SEAM]` |

## Naming bridge: operator surface vs historical stacks

| Concept | Preferred (TypeScript) | Historical | Driver script |
|---------|------------------------|------------|---------------|
| Unified CLI | **`tied agentstream`** | Ruby `run_agent_stream.rb` (removed) | `run-feature-batch-agentstream.sh` |
| Implementation tree | `mcp-server/packages/agentstream/` | Go `tools/agentstream/` (removed Phase **4d**) | — |
| TDD YAML expansion | `tddloop-load.ts` | `TddLoopPrompts` (Ruby) | `--tdd-yaml` |
| Feature batch | `featurespec-load-turns.ts` | FeatureSpecBatchPrompts (Ruby) | `-b` / positional batch |
| Lead checklist | `checklist-load-turns.ts` | partial Ruby parity | `-c` |
| Stream JSON executor | `live-executor.ts` / `executor-run.ts` | `run_agent_stream_subprocess` | spawns `cursor agent` |

Ruby-era terms: [`agent-stream-ruby.md`](agent-stream-ruby.md). **`REQ-GOAGENT-*`** / **`IMPL-GOAGENT-*`** tokens name the checklist-runner contract; pseudo-code block names may retain Go-era identifiers.

---

## TypeScript modules (catalog)

| Module (under `packages/agentstream/src/`) | Role | IMPL |
|--------------------------------------------|------|------|
| `index.ts`, `ts-native-args.ts` | CLI entry, argv resolution | [IMPL-GOAGENT-CLI-CMD](../implementation-decisions/IMPL-GOAGENT-CLI-CMD.yaml) |
| `pipeline-build.ts`, `run-pipeline-prep.ts`, `pipeline-session.ts` | Turn assembly, preload, chain slice | [IMPL-GOAGENT-PIPELINE](../implementation-decisions/IMPL-GOAGENT-PIPELINE.yaml) |
| (argv + prompt paths) | Text sources | [IMPL-GOAGENT-TEXT-SOURCES](../implementation-decisions/IMPL-GOAGENT-TEXT-SOURCES.yaml) |
| `featurespec-load-turns.ts`, `featurespec-preview.ts` | Batch YAML → turns | [IMPL-GOAGENT-FEATURESPEC](../implementation-decisions/IMPL-GOAGENT-FEATURESPEC.yaml) |
| `tddloop-load.ts` | TDD loop YAML → turns | [IMPL-GOAGENT-TDDLOOP](../implementation-decisions/IMPL-GOAGENT-TDDLOOP.yaml) |
| `checklist-load-turns.ts`, `checklist-preview.ts` | Lead checklist → turns | [IMPL-GOAGENT-CHECKLIST](../implementation-decisions/IMPL-GOAGENT-CHECKLIST.yaml) |
| `live-executor.ts`, `executor-run.ts`, `executor-dry-run.ts` | Subprocess + stream-json | [IMPL-GOAGENT-EXECUTOR](../implementation-decisions/IMPL-GOAGENT-EXECUTOR.yaml) |
| `htmlformat.ts` | Non-compact HTML | [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT](../implementation-decisions/IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT.yaml) |
| `control.ts` | Checklist control trailer | [IMPL-GOAGENT-CHECKLIST-CONTROL](../implementation-decisions/IMPL-GOAGENT-CHECKLIST-CONTROL.yaml) |
| `tiedpreflight.ts` | Static MCP layout check | [REQ-GOAGENT-CLI-CONFIG](../requirements/REQ-GOAGENT-CLI-CONFIG.yaml) |
| Turn/session types (TS + pseudo-code) | `Turn`, session id | [IMPL-GOAGENT-LIB-TYPES](../implementation-decisions/IMPL-GOAGENT-LIB-TYPES.yaml) |

---

## Pipeline turn order

Default **`pipeline.Build`** concatenation (see [IMPL-GOAGENT-PIPELINE-pseudocode.md](../implementation-decisions/IMPL-GOAGENT-PIPELINE-pseudocode.md)):

1. argv words (after `--`)
2. `--prompts-file` (not `--prompt-file` — preload handled separately)
3. `--tdd-yaml` paths
4. **`--feature-spec-batch-yaml`** then **`--lead-checklist-yaml`** (default)
5. `--verify-session` sentinel turn

**`--lead-checklist-before-feature`:** when both `-b` and `-c` set, steps 4–5 swap (checklist first, then feature-spec).

**`--prompt-file`:** not a pipeline turn; `ReadPromptFilePreload` + `ApplyPromptFilePreload` prepends one argv part per file on turns that start a **new** session.

---

## CLI flags (catalog)

| Flag | Config field | Notes |
|------|--------------|-------|
| `-d`, `--dry-run` | `DryRun` | No subprocess |
| `-s`, `--session-id` | `SessionID` | Required when `-f` > 1 |
| `-f`, `--first-turn` | `FirstTurn` | 1-based slice after Build |
| `-w`, `--workspace` | `Workspace` | Default cwd |
| `-c`, `--lead-checklist-yaml` | `LeadChecklistYAML` | Read-only lead checklist definition path |
| `--checklist-tracker-yaml` | `ChecklistTrackerYAML` | Writable per-request Authoritative Tracker path |
| `--adherence-ledger` | `AdherenceLedger` | Writable adherence ledger path (Stage G committed) |
| **`--checklist-tracker-preview`** | `PreviewChecklistTrackerYAML` | Read-only migration preview path; requires `-c`; prints JSON and exits |
| `--lead-checklist-from-step` | `LeadChecklistStepFromID` | Inclusive lower bound (slug or id) |
| `--lead-checklist-to-step` | `LeadChecklistStepToID` | Inclusive upper bound |
| `--lead-checklist-skip-sub` | `LeadChecklistSkipSub` | Omit `sub_procedures` |
| `--lead-checklist-before-feature` | `LeadChecklistBeforeFeatureSpec` | Checklist before batch |
| `--checklist-var`, `--lead-checklist-var` | `ChecklistVars` | `KEY=VALUE`; expands `{{KEY}}` |
| `--checklist-var-strict` | `ChecklistVarStrict` | Or `AGENTSTREAM_CHECKLIST_VAR_STRICT=1` |
| `-p`, `--prompt-file` | `PromptFiles` | Preload on new-session turns |
| `--prompts-file` | `PromptsFiles` | One turn per file |
| `--tdd-yaml` | `TddYAMLs` | Repeatable |
| `-b`, `--feature-spec-batch-yaml` | `FeatureSpecBatchYAMLs` | Repeatable |
| `--preview-feature-spec-batch-yaml` | `PreviewFeatureSpecBatchYAML` | Early exit preview |
| `-o`, `--select-order` | `OrderFilterRaw` | Feature-spec order filter |
| `--verify-session` | `VerifySession` | Sentinel prompt turn |
| `--tied-mcp-preflight` | enables preflight | Or `AGENTSTREAM_TIED_MCP_PREFLIGHT=1` |
| `--skip-tied-mcp-preflight` | `SkipTiedMCPPreflight` | Default skip |
| `-y`, `--yes` | `AssumeTiedMCPYes` | Non-interactive preflight |
| `--mcp-json` | `MCPJSONPath` | Explicit `.cursor/mcp.json` |
| `--skip-workspace-preload` | `skipWorkspacePreload` | Or `AGENTSTREAM_SKIP_WORKSPACE_PRELOAD=1` |
| non-compact HTML flags | `NonCompactHTML`, indent | See [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT](../implementation-decisions/IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT.yaml) |

Workspace preload: when `tied/agent-preload-contract.yaml` exists, CLI prepends it before explicit `-p` paths unless skip preload.

---

## Core types

Logical turn shape (names appear in **`IMPL-GOAGENT-*`** pseudo-code; TypeScript implements the same fields):

```text
Turn { parts: string[], chainFromPrevious: bool }
SessionID — opaque string; resume via --session-id / --resume
VerifySessionPrompt = "what was the most recent prompt?"
```

---

## Pseudo-code block names

| Preferred term | UPPER_SNAKE block | Owning IMPL |
|----------------|-------------------|-------------|
| CLI main | `main` | [IMPL-GOAGENT-CLI-CMD](../implementation-decisions/IMPL-GOAGENT-CLI-CMD.yaml) |
| Parse and resolve config | `ParseAndResolve` | [IMPL-GOAGENT-CLI-CMD](../implementation-decisions/IMPL-GOAGENT-CLI-CMD.yaml) |
| Build pipeline | `pipeline_Build` | [IMPL-GOAGENT-PIPELINE](../implementation-decisions/IMPL-GOAGENT-PIPELINE.yaml) |
| Read prompt preload | `ReadPromptFilePreload` | [IMPL-GOAGENT-PIPELINE](../implementation-decisions/IMPL-GOAGENT-PIPELINE.yaml) |
| Apply prompt preload | `ApplyPromptFilePreload` | [IMPL-GOAGENT-PIPELINE](../implementation-decisions/IMPL-GOAGENT-PIPELINE.yaml) |
| Chain between turns | `ChainBetween` | [IMPL-GOAGENT-PIPELINE](../implementation-decisions/IMPL-GOAGENT-PIPELINE.yaml) |
| Slice from first turn | `SliceFromFirstTurn` | [IMPL-GOAGENT-PIPELINE](../implementation-decisions/IMPL-GOAGENT-PIPELINE.yaml) |
| Text sources | `text_sources` | [IMPL-GOAGENT-TEXT-SOURCES](../implementation-decisions/IMPL-GOAGENT-TEXT-SOURCES.yaml) |
| Feature spec from YAML | `featurespec_from_yaml` | [IMPL-GOAGENT-FEATURESPEC](../implementation-decisions/IMPL-GOAGENT-FEATURESPEC.yaml) |
| TDD loop messages | `tddloop_messages` | [IMPL-GOAGENT-TDDLOOP](../implementation-decisions/IMPL-GOAGENT-TDDLOOP.yaml) |
| Checklist messages | `checklist_messages` | [IMPL-GOAGENT-CHECKLIST](../implementation-decisions/IMPL-GOAGENT-CHECKLIST.yaml) |
| Executor run | `executor_Run` | [IMPL-GOAGENT-EXECUTOR](../implementation-decisions/IMPL-GOAGENT-EXECUTOR.yaml) |
| Apply HTML to turns | `APPLY_TO_TURNS` | [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT](../implementation-decisions/IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT.yaml) |
| Format non-compact HTML | `FORMAT_NON_COMPACT_HTML` | [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT](../implementation-decisions/IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT.yaml) |
| Deterministic HTML | `DETERMINISTIC_NON_COMPACT_HTML_FOR_PART` | [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT](../implementation-decisions/IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT.yaml) |
| Integrate with main | `INTEGRATE_WITH_MAIN` | [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT](../implementation-decisions/IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT.yaml) |
| Map config to HTML options | `MAP_CONFIG_TO_HTMLFORMAT_OPTIONS` | [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT](../implementation-decisions/IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT.yaml) |
| Parse control JSON | `PARSE_CONTROL` | [IMPL-GOAGENT-CHECKLIST-CONTROL](../implementation-decisions/IMPL-GOAGENT-CHECKLIST-CONTROL.yaml) |
| Validate control | `VALIDATE_CONTROL` | [IMPL-GOAGENT-CHECKLIST-CONTROL](../implementation-decisions/IMPL-GOAGENT-CHECKLIST-CONTROL.yaml) |
| Apply control | `APPLY_CONTROL` | [IMPL-GOAGENT-CHECKLIST-CONTROL](../implementation-decisions/IMPL-GOAGENT-CHECKLIST-CONTROL.yaml) |
| Authoritative Tracker materialization | `MATERIALIZE_AUTHORITATIVE_TRACKER` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Tracker completion receipt parsing | `PARSE_TRACKER_COMPLETION_RECEIPT` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Tracker disposition write | `APPLY_TRACKER_DISPOSITION` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Tracker loop-back invalidation | `INVALIDATE_TRACKER_DOWNSTREAM` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Runner Tracker composition | `COMPOSE_TRACKER_WITH_CHECKLIST_GATE` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) · wired from [IMPL-GOAGENT-CLI-CMD](../implementation-decisions/IMPL-GOAGENT-CLI-CMD.yaml) |
| Instruction evidence render | `RENDER_INSTRUCTION_EVIDENCE` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Final assistant text separation | `SEPARATE_FINAL_ASSISTANT_TEXT` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) · [IMPL-GOAGENT-EXECUTOR](../implementation-decisions/IMPL-GOAGENT-EXECUTOR.yaml) |
| Receipt instruction binding | `BIND_RECEIPT_TO_INSTRUCTION` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Evidence ref resolution | `RESOLVE_EVIDENCE_REFS` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Gate decision receipt persistence | `PERSIST_GATE_DECISION_RECEIPT` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Status mutation receipt persistence | `PERSIST_STATUS_MUTATION_RECEIPT` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Adherence chain reconciliation | `RECONCILE_ADHERENCE_CHAIN` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Active turn marker lifecycle | `ACTIVE_TURN_MARKER` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Live action attempted append | `APPEND_ACTION_ATTEMPTED` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |
| Tracker migration preview | `PREVIEW_TRACKER_MIGRATION` | [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT](../implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT.yaml) |

---

## Alphabetical index

| Term | Section |
|------|---------|
| adherence event class | Preferred terms |
| adherence ledger | Preferred terms |
| adherence reconciliation | Preferred terms |
| active-turn marker | Preferred terms |
| append-only bridge | Preferred terms |
| hook_log_ref | Preferred terms |
| PreviewTrackerMigration | Preferred terms |
| agentstream | Preferred terms |
| agentstream_control | Preferred terms |
| ApplyPromptFilePreload | Pseudo-code blocks |
| Authoritative Tracker | Preferred terms |
| evidence ref resolution | Preferred terms |
| generic prose ref | Preferred terms |
| manifest ref | Preferred terms |
| outcome_verified event | Preferred terms |
| resolved evidence ref | Preferred terms |
| ChainFromPrevious | Preferred terms |
| checklist_messages | Pseudo-code blocks |
| dry-run | Preferred terms |
| executor_Run | Pseudo-code blocks |
| feature-spec batch | Preferred terms |
| lead checklist | Preferred terms |
| ParseAndResolve | Preferred terms |
| pipeline Build | Preferred terms |
| pipeline_Build | Pseudo-code blocks |
| ReadPromptFilePreload | Pseudo-code blocks |
| Tracker completion receipt | Preferred terms |
| Tracker writer | Preferred terms |
| Turn | Preferred terms |
| VerifySessionPrompt | Core types |
