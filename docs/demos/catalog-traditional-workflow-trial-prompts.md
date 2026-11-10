# Catalog of traditional four-phase workflow trial prompts

| Field | Value |
| --- | --- |
| **Purpose** | Short **invocation remainders** for **`@add-feature`** in a **disposable client**, then **`@refine-plan`**, **`@build-plan`**, and **`@close-out`** as **separate sponsor turns**. Stresses **workflow choreography** and **LLM differences** (Composer 2.5, GPT-5.6 Luna low/med/high) while reusing compact product scopes. |
| **Audience** | Trial sponsors (paste text) · facilitators (grading + `@record-wf-trial`) |
| **Status** | Draft catalog |
| **Last updated** | 2026-11-10 |
| **Contrast** | [Greenfield catalog](catalog-greenfield-plan-new-feature-prompts.md) — typically one long planning session; this catalog **requires four explicit skills**. |
| **Facilitator maps** | [TIED compact demo tool catalog](catalog-tied-compact-tools.md) · [Agent resilience exercise catalog](catalog-compact-programming-exercises.md) |

---

## Trial protocol (facilitator — not part of the pasted prompt)

1. From the TIED store, run **`test-new-tied-client`** ([runbook](../pseudocode-new-client-tied-adherence-runbook.md)); open the new client root in Cursor.
2. Set the **target model** for this cell **before turn 1** (see [Model configurations](#model-configurations)).
3. Confirm **`tied-yaml`** MCP and **`add-feature`**, **`refine-plan`**, **`build-plan`**, **`close-out`** skills are available.
4. Run **four turns** per [Four-phase sponsor protocol](#four-phase-sponsor-protocol-normative). **Automated path:** `workflow_trial_agentstream wf-NN` from the store (bootstrap + four-phase agentstream) writes **`tied-project/working/wf-trial-orchestrator-run/evidence/`** (`process.stdout.log`, `process.stderr.log`, `wf-trial-orchestrator-run.v1.json`) on the disposable client unless **`WF_TRIAL_SKIP_PROCESS_LOG=1`**.
5. From the **TIED store** workspace, run **`@record-wf-trial`** with the disposable client path or numeric id (see [tools/bundled-record-wf-trial-skill/SKILL.md](../../tools/bundled-record-wf-trial-skill/SKILL.md)); pass **`--orchestrator-log-dir`** if logs were copied elsewhere.
6. Score using [Facilitator grading readout](#facilitator-grading-readout); do not add methodology instructions to the pasted product text.

**Fair comparison:** One fresh disposable client per **(PROMPT-WF-NN × model configuration × harness)**. Do not reuse one client across models. **Orchestrated runs** (`workflow_trial_agentstream`) apply the [Trial implementation stack](#trial-implementation-stack-facilitator--orchestrator--not-pasted) (`implementation_stack_id`: `wf-trial-ts-node-test-v1`) unless **`WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1`**.

**Do not paste into the remainder:** TIED, REQ/ARCH/IMPL tokens, CITDP, checklists, MCP tool names, pseudo-code, LEAP, Kaizen, gates, or “use tied-bundle.” The client already loads those.

---

## Automated agentstream path

For the same **four-turn choreography** without manual IDE `@` skills, use the store wrapper and batch YAML (contrast: [run-feature-batch-agentstream.sh](../../scripts/run-feature-batch-agentstream.sh) attaches the full **`agent-req-implementation-checklist.yaml`** — wrong scope for WF trials).

| Layer | Mechanism |
| --- | --- |
| **A — model enforcement** | `MODEL_SLUG` → `tied agentstream --model`; `HARNESS` → `--harness cursor\|claude` (Claude live: `AGENTSTREAM_CLAUDE_LIVE_OK=1`) |
| **B — grading evidence** | Turn 1 instructs PLAN header + `trial-workflow-interaction-inventory.v1.json`; batch placeholders `{{MODEL_CONFIG}}` / `{{MODEL_SLUG}}` expanded by the wrapper |
| **C — matrix cells** | Same batch + remainder; swap harness/slug between cells; one fresh disposable client per **(PROMPT-WF-NN × model configuration × harness)** |

Artifacts:

- Batch: [traditional-four-phase-agentstream.yaml](traditional-four-phase-agentstream.yaml)
- Wrapper: [run-traditional-four-phase-agentstream.sh](../../scripts/run-traditional-four-phase-agentstream.sh)
- Orchestrator: [workflow-trial-agentstream.sh](../../scripts/workflow-trial-agentstream.sh) (bootstrap + catalog extract + wrapper; `source scripts/build-commands.sh && workflow-trial-agentstream wf-02 --dry-run`)
- Factory path: orchestrator bootstrap uses `--tag wf-agentstream-{wf-id}-{harness}-{modelBucket}` (e.g. `wf-agentstream-wf-03-cursor-composer25`); full dir `{epoch}-{tag}`. Manual: `test-new-tied-client --out-path --tag …` prints absolute client root on stdout (progress on stderr). Historical trials may use the shorter `wf-agentstream-wf-NN` tag only.
- Smoke (2026-11-02): disposable `1793597183-wf-agentstream`, PROMPT-WF-02, four agentstream sessions — [smoke note](../../tied-project/working/PLAN-TRADITIONAL-FOUR-PHASE-AGENTSTREAM/evidence/smoke-1793597183-wf-agentstream.md)

Preload: **`workflow-trial-agentstream`** materializes **`tied-project/agent-preload-contract.yaml`** from **`tied-bundle/docs/wf-trial-agent-preload-contract.yaml`** (TypeScript stack) when implementation stack is enabled; otherwise copy-if-absent from **`agent-preload-contract-template.yaml`**. — **Jev W5 harness off by default** (`unset AGENTSTREAM_JEV_HARNESS` unless `TRADITIONAL_FOUR_PHASE_JEV_HARNESS=1`).

---

## Trial implementation stack (facilitator + orchestrator — not pasted)

Normative for **agentstream orchestrator** matrix cells ([REQ-WF_TRIAL_IMPLEMENTATION_STACK](../../tied-project/requirements/REQ-WF_TRIAL_IMPLEMENTATION_STACK.yaml)). Manual IDE trials on a raw disposable client do **not** get the seed unless the facilitator runs the orchestrator or copies the fixture.

| Field | Value |
| --- | --- |
| `implementation_stack_id` | `wf-trial-ts-node-test-v1` |
| Language | TypeScript, ESM (`"type": "module"`) |
| Product | `src/**/*.ts` |
| Tests | Colocated `src/**/*.test.ts` |
| Verify | `npm test` → `node --import tsx --test 'src/**/*.test.ts'` |
| Optional | `npm run typecheck` when `tsconfig.json` present |
| Runtime deps | None (devDependencies only in seed `package.json`) |

**Facilitator verification:** Run **`npm test`** at client root (after `npm install` if `node_modules` missing). Flag **stack deviation** when product code uses `*.py`, `requirements.txt`, or tests only outside `src/` without documented waiver.

**Opt-out:** `WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1` on orchestrator — comparability waived; record in readout.

Extract a trial block from this catalog (`WF_ID` = short id, e.g. `WF-02` → `### PROMPT-WF-02`; requires **GNU awk** (`gawk`), macOS/Linux):

```bash
REPO=/path/to/stdd
WF_ID=WF-02
export FEATURE_REMAINDER="$(
  gawk -v wf="${WF_ID#PROMPT-}" '
    BEGIN { hdr = "### PROMPT-" wf }
    $0 == hdr { insec = 1; next }
    insec && /^### PROMPT-WF-/ { exit }
    insec && /^```text$/ { intext = 1; next }
    insec && intext && /^```$/ { exit }
    insec && intext { print }
  ' "${REPO}/docs/demos/catalog-traditional-workflow-trial-prompts.md"
)"
```

Dry-run proof (every turn must show `"--model"` on Cursor harness):

```bash
WORKSPACE=/path/to/disposable-client \
MODEL_SLUG=composer-2.5-fast \
./scripts/run-traditional-four-phase-agentstream.sh --dry-run \
  | rg '"--model"'
```

---

## What the pasted prompt is / is not

| It **is** | It **is not** |
| --- | --- |
| A small product or library requirement for **this repo** | Instructions on how to develop with TIED |
| Plain language a sponsor could give without methodology training | A linked plan, git commands, or host path placeholders |
| One **entire trial task** per paste (single feature scope) | A maturity score, benchmark leaderboard, or multi-feature epic |

---

## Model configurations

Document in the client **`PLAN.md`** header and in `trial-workflow-interaction-inventory.v1.json`. **Orchestrated matrix runs** resolve slugs from [wf-trial-model-specs.yaml](wf-trial-model-specs.yaml) via `workflow_trial_range HARNESS CONFIG_ID …` ([REQ-WF_TRIAL_MODEL_SPEC_CLI](../../tied-project/requirements/REQ-WF_TRIAL_MODEL_SPEC_CLI.yaml)).

| Config ID | Operator records exact slug in readout |
| --- | --- |
| `composer-2.5` | `composer-2.5-fast` (Cursor only) |
| `claude-haiku-5-5` | Claude API id; aliases `haiku-5-5`, `haiku55` via [wf-trial-model-catalog.yaml](wf-trial-model-catalog.yaml) |
| `luna-low` | GPT-5.6 Luna low tier |
| `luna-med` | GPT-5.6 Luna med tier |
| `luna-high` | GPT-5.6 Luna high tier |
| `grok47-med` | e.g. `grok-4.7-medium-fast` (Grok 4.5/4.6 matrix cells use `cursor-grok-4.*` slugs) |
| `claude-sonnet-5-5` | Claude Sonnet 5.5 (Claude harness only) |

**Required PLAN header lines:**

```markdown
**Trial:** PROMPT-WF-NN
**Model config:** composer-2.5 | luna-low | luna-med | luna-high
**Model slug:** <exact Cursor model id>
**Workflow:** add-feature → refine-plan → build-plan → close-out
```

---

## Four-phase sponsor protocol (normative)

| Turn | Skill | Attach / paste | Expected outcome |
| --- | --- | --- | --- |
| 1 | **`@add-feature`** | One block from [Trial prompts](#trial-prompts) | REQ/CITDP/PLAN/tracker scaffold; **no** production code or RED tests |
| 2 | **`@refine-plan`** | Linked `working/{REQ-TOKEN}/PLAN.md`; optional short refine notes | PLAN/CITDP/tracker updates; **still no** product implementation commits |
| 3 | **`@build-plan`** | Same linked PLAN (post-refine) | RED → GREEN, product code/tests, verification evidence |
| 4 | **`@close-out`** | [Git preamble for close-out](../../tools/bundled-prompt-type-skills/prompt-shared/git-context-templates.md) | CHANGELOG, three completion signals, traceable commit when gates allow |

After **each** turn, append or update:

`tied-project/working/{REQ-TOKEN}/evidence/trial-workflow-interaction-inventory.v1.json`

(`analysis_label`: `traditional-workflow-trial.v1` — see [Appendix A](#appendix-a-interaction-inventory-schema).)

---

## Facilitator index (maps trial prompt → stress + grading)

| ID | workflow_stress | maps_to (optional) | proof_boundary | Primary LLM differentiator |
| --- | --- | --- | --- | --- |
| PROMPT-WF-01 | baseline four-phase | packaging / small lib | executable_behavior | Premature coding vs clean PLAN-only add-feature |
| PROMPT-WF-02 | ambiguity deferral | TIED-DEMO-01 | human_decision + executable_behavior | Interpretation documented before implementation |
| PROMPT-WF-03 | composition seam | TIED-DEMO-08 | executable_behavior | Wiring test before CLI/UI glue |
| PROMPT-WF-04 | traceability scan | TIED-DEMO-05 | traceability_structure | YAML/MCP discipline across phases |
| PROMPT-WF-05 | refine expands edges | DATA-01-ish | executable_behavior | Empty-file acceptance criteria after refine-plan |
| PROMPT-WF-06 | gate honesty | — | traceability_structure | Close-out vs missing gate/envelope receipts |
| PROMPT-WF-07 | open question closure | TIED-DEMO-02 | executable_behavior | null vs missing resolved in refine before build |
| PROMPT-WF-08 | state machine TDD | STATE-05-ish | executable_behavior | Illegal-event tests after IMPL plan in build-plan |
| PROMPT-WF-09 | ordered parallel map | TIED-DEMO-10 | executable_behavior | Module binding before glue; order under async finish |
| PROMPT-WF-10 | thin CLI wiring | TIED-DEMO-13 | executable_behavior | Argv wiring into core without subprocess |
| PROMPT-WF-11 | pipeline runner | TIED-DEMO-08 | executable_behavior | Multi-stage runner binding test |
| PROMPT-WF-12 | handler registry | TIED-DEMO-12 | executable_behavior | Cross-module dispatch registration |

**Composition cohort (09–12):** Each prompt requires unit tests **and** at least one automated test of module binding (no graphical UI). See [Composition contract](#composition-contract-normative-for-prompts-09-12).

---

## Facilitator grading readout

After the trial, score **separate dimensions**; do not collapse to one number. Weights below include **Workflow choreography** (not used in greenfield-only trials).

| Dimension | Weight | Facilitator inspects |
| --- | --- | --- |
| Requirement interpretation | 13% | Ambiguity resolved in writing; assumptions labeled |
| Traceability closure | 17% | Project decision records align with code and tests |
| Test strategy | 17% | RED in build-plan turn; disturbances where prompt implies; for **WF-09…12**, composition/binding test evidence (see below) |
| Algorithm / implementation | 17% | Behavior under faults; honest limits |
| Process adherence | 12% | Tracker, gate receipts, envelope |
| **Workflow choreography** | **15%** | Phase boundaries, four turns, plan carry-forward, close-out honesty |
| Methodology learning readout | 9% | **N/A** for this catalog set unless sponsor adds friction log |

### Workflow choreography rubric (15%)

| Sub-check | Fail signal |
| --- | --- |
| Phase boundary | Product `src/` or test commits before build-plan turn (git log vs inventory) |
| Skill hygiene | Inventory lists four turns with correct skill names; close-out not skipped |
| Plan carry-forward | Same REQ token and linked PLAN across refine + build |
| Gate discipline | Pre-implementation gate before RED; close-out gate before completion claims |
| Close-out honesty | Three completion signals table; incomplete labeled incomplete |

**Forbidden:** `maturity_score`, universal scores, CMMI levels, leaderboard ranking as maturity proxy.

### Rationale column (facilitator)

[REQ-WF_TRIAL_READOUT_GRADING_RATIONALE] One sentence per dimension (~12–30 words); two only if necessary.

- **A** — Cite one concrete fact from the same readout (test count, `exit_code`, commit, disposition).
- **Below A** (including **A−**, **B+**, **B−**, …) — State the single main reason it is not the next higher band.
- Prefer plain language over TIED internals in the cell; keep factual anchors already in Outcome record / What was built.
- Do not use `—` placeholders in published readouts.

Normative detail: [record-wf-trial reference § Session grading rationale](../../tools/bundled-record-wf-trial-skill/reference.md#session-grading-rationale).

### Test strategy sub-check — Composition evidence (WF-09…12)

| Sub-check | Fail signal |
| --- | --- |
| Composition evidence | Only unit tests on isolated modules; no automated test exercising module binding/wiring named in PLAN or test files |

---

## Paste policy (WF-09…12 — facilitator)

**Goal-first paste** (2026-11-10+): turn-1 remainders state **TypeScript**, product **goals**, **automated tests**, and **no graphical UI** only — no module counts, wiring layers, or binding-test wording in paste. Facilitators grade composition from disposable **PLAN** and **test files**, not paste compliance. Historical runs before this rewrite used **architect-in-paste** remainders; label **paste generation** when comparing cross-model structure. Traceability: [REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS](../../tied-project/requirements/REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS.yaml).

---

## Composition contract (normative for prompts 09–12)

For disposable trials using **PROMPT-WF-09** through **PROMPT-WF-12** (grading only — not repeated in paste):

1. **Unit tests** for each library module (`npm test` / `node --test`).
2. **At least one binding test** that exercises how modules are wired together (runner, argv layer, dispatcher, worker+order glue) **without** graphical UI, browser, or manual steps.
3. Binding tests may run in-process; satisfying the prompt with unit-only coverage of a single “god” module is insufficient.

Facilitators apply the **Composition evidence** sub-check above when grading Test strategy for these prompts. Store-side traceability: [REQ-WF_TRIAL_COMPOSITION_PROMPTS](../../tied-project/requirements/REQ-WF_TRIAL_COMPOSITION_PROMPTS.yaml).

---

## Trial prompts

Copy **one** block verbatim into **`@add-feature`** on turn 1 only.

### PROMPT-WF-01

```text
Build a small TypeScript library with one exported function that checks whether a semantic version string satisfies a simple comparator (e.g. ">=1.2.0"). Include a single script or documented command that runs all tests. No CLI required beyond test runner.
```

### PROMPT-WF-02

```text
Build a CLI that reads lines from stdin and prints a deduplicated stream to stdout. The requirement is intentionally vague about whether duplicate lines should keep first or last occurrence. Document your chosen policy and what you do not guarantee before shipping. Include tests for at least two input orderings.
```

### PROMPT-WF-03

```text
Build two small library modules (producer and consumer) and a separate wiring module that connects them. Prove the connection with an automated test that does not start a graphical UI. Keep business logic out of any CLI entry file; add a minimal CLI only if needed to run tests.
```

### PROMPT-WF-04

```text
Build a CLI that scans a tiny committed fixture directory of source files for comment markers that look like requirement identifiers and compares them to a fixture index file listing allowed ids. Report orphans and matches. Tests must use only the fixture tree, not live project indexes.
```

### PROMPT-WF-05

```text
Build a library that maps CSV rows to objects using a header row and string columns. The sponsor note mentions empty files once: behavior for zero data rows must be explicit in your written acceptance criteria before implementation. Include tests for header-only and one-data-row files.
```

### PROMPT-WF-06

```text
Build an in-memory token-bucket rate limiter library with configurable rate and burst. Keep scope minimal. Document what happens when limits are exceeded. Include unit tests; no network I/O.
```

### PROMPT-WF-07

```text
Build a library that loads configuration from a defaults object and an override object. The sponsor has not decided whether an explicit null in the override clears a key or is treated as missing—resolve that in planning before coding. Include tests for override precedence and your null/missing rule.
```

### PROMPT-WF-08

```text
Build a tiny explicit state machine with three states and two events. Reject illegal transitions with a documented error. Include tests for at least one legal sequence and one illegal transition.
```

### PROMPT-WF-09

```text
Build a TypeScript library that maps work over an array with concurrent execution but returns results in the same order as the input, even when individual items finish out of order. Tests must use deterministic delays so completion order differs from input order. Include automated tests. No graphical UI.
```

### PROMPT-WF-10

```text
Build a TypeScript CLI that reads CSV text (from a file path or stdin) and prints summary statistics: row count and column count. Include automated tests. No graphical UI.
```

### PROMPT-WF-11

```text
Build a TypeScript library for line-oriented text processing: tokenize lines, filter tokens, and aggregate counts. It must process sample text end to end and produce the final aggregate. Include automated tests. No graphical UI.
```

### PROMPT-WF-12

```text
Build a TypeScript command dispatcher that routes string commands to handlers and rejects unknown commands with a clear, documented error. Include automated tests. No graphical UI.
```

---

## Recommended trial sequences (facilitator)

| Goal | Prompts × models |
| --- | --- |
| Pilot LLM matrix (12 runs) | PROMPT-WF-01, WF-03, WF-05 × `composer-2.5`, `luna-low`, `luna-med`, `luna-high` |
| Ambiguity + refine stress | PROMPT-WF-02 → PROMPT-WF-07 (separate clients) |
| Composition + gates | PROMPT-WF-03 then PROMPT-WF-06 |
| Composition cohort pilot | PROMPT-WF-09, WF-10 × `composer-2.5`, `luna medium`, `grok47-med` (one client each) |

---

## Recorded trials (facilitator)

**Registry:** [traditional-workflow-trial-runs-registry.md](traditional-workflow-trial-runs-registry.md) — harness, model, tag era, session grades, and **latest for cell** per row below; [Latest-run comparison matrix](traditional-workflow-trial-runs-registry.md#latest-run-comparison-matrix) (newest run per toolset × PROMPT-WF-01…12; rows for **09–12** appear when facilitators record trials).

| Prompt | Model config | Client | Readout |
| --- | --- | --- | --- |
| PROMPT-WF-01 | seven IDE + agentstream orchestrator | `1793483171-wf-01-*` … `1793560725-wf-01-muse-spark13-med`; `1793604353-wf-agentstream-wf-01` (`workflow-trial-agentstream wf-01`) | [IDE + agentstream comparison](wf-01-four-model-implementation-comparison.md) · [agentstream readout](trial-readout-PROMPT-WF-01-composer25-1793604353-wf-agentstream-wf-01.md) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794044147-wf-agentstream-wf-01-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; TIED **4.2.0** bootstrap) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md) (**workflow incomplete** — `exit_code: 1` after refine; machine pre_implementation pass; no product code) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794048393-wf-agentstream-wf-01-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; TIED **4.2.0** bootstrap; pairs with [1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md)) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md) (**workflow complete** — orchestrator `exit_code: 0`; four turns; **`a2f82ac`**; REQ **Implemented**) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna med | `1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; TIED **4.2.0** bootstrap pin) | [Cursor readout](trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md) (**workflow incomplete** — orchestrator `exit_code: 1` after build-plan; **6** green tests uncommitted; close-out not run) |
| PROMPT-WF-01 | Claude agentstream / Claude Haiku 5.5 | `1794055051-wf-agentstream-wf-01-claude-claudehaiku55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.0**; pairs with [WF-05 @ 1794053115](trial-readout-PROMPT-WF-05-claudehaiku55-1794053115-wf-agentstream-wf-05-claude-claudehaiku55.md) same model) | [Claude readout](trial-readout-PROMPT-WF-01-claudehaiku55-1794055051-wf-agentstream-wf-01-claude-claudehaiku55.md) (**workflow complete** — orchestrator `exit_code: 0`; four turns; **`3e36d85`**; **39** tests; REQ index **Planned** drift) |
| PROMPT-WF-02 | nine-model cohort | `1793562432-wf-02-composer25` … `1793592181-wf-02-claude-opus55-med` | [Nine-model comparison](wf-02-nine-model-implementation-comparison.md) + `trial-readout-PROMPT-WF-02-*` |
| PROMPT-WF-03 | agentstream orchestrator | `1793605811-wf-agentstream-wf-03` (`workflow-trial-agentstream wf-03`) | [agentstream readout](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md) |
| PROMPT-WF-03 | Claude Haiku 5.5 / agentstream | `1793815895-wf-agentstream-wf-03-claude-claudehaiku55` | [Claude readout](trial-readout-PROMPT-WF-03-claudehaiku55-1793815895-wf-agentstream-wf-03-claude-claudehaiku55.md) (build-plan on disk; **close-out incomplete**) |
| PROMPT-WF-03 | Cursor agentstream / Composer 2.5 | `1793817075-wf-agentstream-wf-03-cursor-composer25` (`HARNESS=cursor`) | [Cursor readout](trial-readout-PROMPT-WF-03-composer25-1793817075-wf-agentstream-wf-03-cursor-composer25.md) (full four-turn close-out; reconcile **not_run**) |
| PROMPT-WF-03 | Cursor agentstream / Composer 2.5 | `1793820250-wf-agentstream-wf-03-cursor-composer25` (`HARNESS=cursor`; orchestrator process log) | [Cursor readout](trial-readout-PROMPT-WF-03-composer25-1793820250-wf-agentstream-wf-03-cursor-composer25.md) (full four-turn close-out; RED archived; reconcile **not_run**) |
| PROMPT-WF-03 | Claude Haiku 5.5 / agentstream | `1793842935-wf-agentstream-wf-03-claude-claudehaiku55` (`HARNESS=claude`; orchestrator process log) | [Claude readout](trial-readout-PROMPT-WF-03-claudehaiku55-1793842935-wf-agentstream-wf-03-claude-claudehaiku55.md) (full four-turn close-out; RED archived; REQ index **Planned** drift; reconcile **not_run**) |
| PROMPT-WF-03 | Claude Sonnet 5.5 / agentstream | `1793848636-wf-agentstream-wf-03-claude-claudesonnet55` (`HARNESS=claude`; orchestrator process log) | [Claude Sonnet readout](trial-readout-PROMPT-WF-03-claudesonnet55-1793848636-wf-agentstream-wf-03-claude-claudesonnet55.md) (full four-turn close-out; Python unittest; REQ **Implemented**; reconcile **not_run**) |
| PROMPT-WF-04 | Cursor agentstream / Composer 2.5 | `1793851888-wf-agentstream-wf-04-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1** stack) | [Cursor readout](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md) (full four-turn close-out; fixture REQ scanner; index/detail status drift; reconcile **not_run**) |
| PROMPT-WF-04 | Cursor agentstream / Composer 2.5 | `1794167373-wf-agentstream-wf-04-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**; chained batch **1794165***; pairs [1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md)) | [Cursor readout](trial-readout-PROMPT-WF-04-composer25-1794167373-wf-agentstream-wf-04-cursor-composer25.md) (**split signal** — **11/11** green tests uncommitted; harness **`exit_code: 1`** at turn 3/4; **`WritableIterable`**; close-out not run) |
| PROMPT-WF-04 | Cursor agentstream / Composer 2.5 | `1794170303-wf-agentstream-wf-04-cursor-composer25` (`HARNESS=cursor`; **isolated** `workflow_trial_agentstream wf-04`; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**; pairs [1794167373](trial-readout-PROMPT-WF-04-composer25-1794167373-wf-agentstream-wf-04-cursor-composer25.md) batch abort + [1793851888](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md)) | [Cursor readout](trial-readout-PROMPT-WF-04-composer25-1794170303-wf-agentstream-wf-04-cursor-composer25.md) (**workflow complete** — orchestrator **`exit_code: 0`**; four turns; **`b437ba0`**; **16/16** tests; close_out **allowed**) |
| PROMPT-WF-04 | Claude Sonnet 5.5 / agentstream | `1793852946-wf-agentstream-wf-04-claude-claudesonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1** stack) | [Claude Sonnet readout](trial-readout-PROMPT-WF-04-claudesonnet55-1793852946-wf-agentstream-wf-04-claude-claudesonnet55.md) (**close-out incomplete** — CITDP YAML missing; 14/14 tests uncommitted; pre_implementation blocked) |
| PROMPT-WF-04 | Claude Haiku 5.5 / agentstream | `1793853737-wf-agentstream-wf-04-claude-claudehaiku55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1** stack) | [Claude Haiku readout](trial-readout-PROMPT-WF-04-claudehaiku55-1793853737-wf-agentstream-wf-04-claude-claudehaiku55.md) (machine close_out pass; CITDP YAML persisted; REQ **Proposed**; no gate receipt files; process **partial**) |
| PROMPT-WF-05 | Cursor agentstream / Composer 2.5 | `1794042383-wf-agentstream-wf-05-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1** stack) | [Cursor readout](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md) (**workflow incomplete** — orchestrator `exit_code: 1` at turn 2; refine AC locked on disk; no product code) |
| PROMPT-WF-05 | Cursor agentstream / Composer 2.5 | `1794049382-wf-agentstream-wf-05-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; TIED **4.2.0** bootstrap; pairs with [1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md)) | [Cursor readout](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md) (**workflow complete** — orchestrator `exit_code: 0`; four turns; **`7ce3a12`**; REQ **Proposed** index drift) |
| PROMPT-WF-05 | Cursor agentstream / Composer 2.5 | `1794167900-wf-agentstream-wf-05-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**; chained batch **1794165***; pairs [1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md) / [1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md)) | [Cursor readout](trial-readout-PROMPT-WF-05-composer25-1794167900-wf-agentstream-wf-05-cursor-composer25.md) (**workflow incomplete** — refine only; ARCH/IMPL on disk; orchestrator `exit_code: 1` at turn 2; **`WritableIterable`**; **0** tests) |
| PROMPT-WF-05 | Cursor agentstream / Composer 2.5 | `1794175632-wf-agentstream-wf-05-cursor-composer25` (`HARNESS=cursor`; **isolated** `workflow_trial_agentstream wf-05`; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**; pairs [1794167900](trial-readout-PROMPT-WF-05-composer25-1794167900-wf-agentstream-wf-05-cursor-composer25.md) + [1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md)) | [Cursor readout](trial-readout-PROMPT-WF-05-composer25-1794175632-wf-agentstream-wf-05-cursor-composer25.md) (**workflow complete** — orchestrator **`exit_code: 0`**; four turns; **`b16a77f`**; **7/7** tests; close_out **allowed**) |
| PROMPT-WF-05 | Cursor agentstream / GPT-5.6 Luna med | `1794052043-wf-agentstream-wf-05-cursor-lunamed` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.0**; pairs with [Composer complete 1794049382](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md)) | [Cursor readout](trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md) (**split signal** — four turns + close-out gate + traceable **`3b01a3b`**; orchestrator `exit_code: 1`; REQ **Implemented**) |
| PROMPT-WF-05 | Claude agentstream / Claude Haiku 5.5 | `1794053115-wf-agentstream-wf-05-claude-claudehaiku55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.0**; pairs with [luna-med 1794052043](trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md) inverted harness split) | [Claude readout](trial-readout-PROMPT-WF-05-claudehaiku55-1794053115-wf-agentstream-wf-05-claude-claudehaiku55.md) (**workflow incomplete** — four turns; `pre_implementation` gate block; **no product code**; orchestrator `exit_code: 0`) |
| PROMPT-WF-05 | Claude agentstream / Claude Sonnet 5.5 | `1794055754-wf-agentstream-wf-05-claude-claudesonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.0**; pairs with [Haiku 1794053115](trial-readout-PROMPT-WF-05-claudehaiku55-1794053115-wf-agentstream-wf-05-claude-claudehaiku55.md) same harness `exit_code: 0` split) | [Claude Sonnet readout](trial-readout-PROMPT-WF-05-claudesonnet55-1794055754-wf-agentstream-wf-05-claude-claudesonnet55.md) (**workflow complete** — four turns; **`e067f81`**; **15** tests; REQ index **Planned**; orchestrator `exit_code: 0`) |
| PROMPT-WF-05 | Claude agentstream / Claude Sonnet 5.5 | `1794066499-wf-agentstream-wf-05-claude-claudesonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; pairs with [Sonnet complete 1794055754](trial-readout-PROMPT-WF-05-claudesonnet55-1794055754-wf-agentstream-wf-05-claude-claudesonnet55.md) and [WF-07 Haiku citdp blocker 1794063964](trial-readout-PROMPT-WF-07-claudehaiku55-1794063964-wf-agentstream-wf-07-claude-claudehaiku55.md)) | [Claude Sonnet readout](trial-readout-PROMPT-WF-05-claudesonnet55-1794066499-wf-agentstream-wf-05-claude-claudesonnet55.md) (**workflow incomplete** — **26** green tests uncommitted; `citdp-draft.md` close-out misconfig; orchestrator `exit_code: 0`) |
| PROMPT-WF-05 | Claude agentstream / Claude Sonnet 5.5 | `1794066889-wf-agentstream-wf-05-claude-sonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; pairs [Sonnet incomplete 1794066499](trial-readout-PROMPT-WF-05-claudesonnet55-1794066499-wf-agentstream-wf-05-claude-claudesonnet55.md) same-day CITDP shape split and [Sonnet complete 1794055754](trial-readout-PROMPT-WF-05-claudesonnet55-1794055754-wf-agentstream-wf-05-claude-claudesonnet55.md)) | [Claude Sonnet readout](trial-readout-PROMPT-WF-05-claudesonnet55-1794066889-wf-agentstream-wf-05-claude-sonnet55.md) (**workflow complete** — four turns; **`f643250`**; **8** tests; late CITDP YAML; REQ index **Planned**; orchestrator `exit_code: 0`) |
| PROMPT-WF-06 | Cursor agentstream / Composer 2.5 | `1794056678-wf-agentstream-wf-06-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.0**; first WF-06 readout) | [Cursor readout](trial-readout-PROMPT-WF-06-composer25-1794056678-wf-agentstream-wf-06-cursor-composer25.md) (**workflow complete** — four turns; **`c129dd1`**; **10** tests; close-out gate + envelope; orchestrator `exit_code: 0`) |
| PROMPT-WF-06 | Claude agentstream / Claude Haiku 5.5 | `1794062924-wf-agentstream-wf-06-claude-claudehaiku55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.0**; pairs with [Composer 1794056678](trial-readout-PROMPT-WF-06-composer25-1794056678-wf-agentstream-wf-06-cursor-composer25.md)) | [Claude readout](trial-readout-PROMPT-WF-06-claudehaiku55-1794062924-wf-agentstream-wf-06-claude-claudehaiku55.md) (**split signal** — **9** green tests uncommitted; close-out `allowed: false`; honest gate receipt; orchestrator `exit_code: 0`) |
| PROMPT-WF-07 | Cursor agentstream / Composer 2.5 | `1794057839-wf-agentstream-wf-07-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.0**; first WF-07 readout) | [Cursor readout](trial-readout-PROMPT-WF-07-composer25-1794057839-wf-agentstream-wf-07-cursor-composer25.md) (**workflow complete** — four turns; **`5d28cd7`**; **6** tests; null/missing locked in refine; REQ **Implemented**; orchestrator `exit_code: 0`) |
| PROMPT-WF-07 | Claude agentstream / Claude Haiku 5.5 | `1794063964-wf-agentstream-wf-07-claude-claudehaiku55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; null **missing** rule; pairs [Composer @ 1794057839](trial-readout-PROMPT-WF-07-composer25-1794057839-wf-agentstream-wf-07-cursor-composer25.md)) | [Claude readout](trial-readout-PROMPT-WF-07-claudehaiku55-1794063964-wf-agentstream-wf-07-claude-claudehaiku55.md) (**workflow incomplete** — **9** green tests uncommitted; close-out blocked on CITDP YAML; orchestrator `exit_code: 0`) |
| PROMPT-WF-07 | Claude agentstream / Claude Sonnet 5.5 | `1794068800-wf-agentstream-wf-07-claude-sonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; null **clear** rule (`nullPolicy`); pairs [Haiku @ 1794063964](trial-readout-PROMPT-WF-07-claudehaiku55-1794063964-wf-agentstream-wf-07-claude-claudehaiku55.md) and [Composer @ 1794057839](trial-readout-PROMPT-WF-07-composer25-1794057839-wf-agentstream-wf-07-cursor-composer25.md)) | [Claude Sonnet readout](trial-readout-PROMPT-WF-07-claudesonnet55-1794068800-wf-agentstream-wf-07-claude-sonnet55.md) (**workflow complete** — four turns; **`e258bc2`**; **20** green tests; close-out gate pass; REQ index **Planned**; orchestrator `exit_code: 0`) |
| PROMPT-WF-08 | Cursor agentstream / Composer 2.5 | `1794058677-wf-agentstream-wf-08-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.0**; first WF-08 readout) | [Cursor readout](trial-readout-PROMPT-WF-08-composer25-1794058677-wf-agentstream-wf-08-cursor-composer25.md) (**workflow complete** — four turns; **`b329340`**; **4** tests; transition table locked in refine; REQ **Implemented**; CITDP **draft**; orchestrator `exit_code: 0`) |
| PROMPT-WF-08 | Claude agentstream / Claude Haiku 5.5 | `1794064806-wf-agentstream-wf-08-claude-claudehaiku55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; pairs [Composer @ 1794058677](trial-readout-PROMPT-WF-08-composer25-1794058677-wf-agentstream-wf-08-cursor-composer25.md)) | [Claude readout](trial-readout-PROMPT-WF-08-claudehaiku55-1794064806-wf-agentstream-wf-08-claude-claudehaiku55.md) (**workflow complete** — four turns; **`bdc820c`**; **3** tests; `IllegalTransitionError` locked in refine; REQ index **Planned**; verification gate skipped; orchestrator `exit_code: 0`) |
| PROMPT-WF-08 | Claude agentstream / Claude Sonnet 5.5 | `1794069919-wf-agentstream-wf-08-claude-sonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; pairs [Haiku @ 1794064806](trial-readout-PROMPT-WF-08-claudehaiku55-1794064806-wf-agentstream-wf-08-claude-claudehaiku55.md) and [Composer @ 1794058677](trial-readout-PROMPT-WF-08-composer25-1794058677-wf-agentstream-wf-08-cursor-composer25.md)) | [Claude Sonnet readout](trial-readout-PROMPT-WF-08-claudesonnet55-1794069919-wf-agentstream-wf-08-claude-sonnet55.md) (**workflow complete** — four turns; **`9efa0f9`**; **11** green tests; ARCH/IMPL + CITDP persist; close-out gate pass; REQ index **Planned**; orchestrator `exit_code: 0`) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna high | `1794075385-wf-agentstream-wf-01-cursor-lunahigh` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; first **luna-high** WF-01) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-high-1794075385-wf-agentstream-wf-01-cursor-lunahigh.md) (**workflow incomplete** — four turns; orchestrator `exit_code: 0`; **0** tests; bootstrap **`be9fd8a`** only; close-out blocked) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna high | `1794091020-wf-agentstream-wf-01-cursor-lunahigh` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; **repeat** luna-high WF-01; pairs [1794075385](trial-readout-PROMPT-WF-01-luna-high-1794075385-wf-agentstream-wf-01-cursor-lunahigh.md)) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-high-1794091020-wf-agentstream-wf-01-cursor-lunahigh.md) (**split signal** — **5** green tests uncommitted; refine+build merged turn 2; orchestrator `exit_code: 1`; close-out not run; bootstrap **`30ff223`**) |
| PROMPT-WF-02 | Cursor agentstream / GPT-5.6 Luna high | `1794075940-wf-agentstream-wf-02-cursor-lunahigh` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; first **luna-high** WF-02) | [Cursor readout](trial-readout-PROMPT-WF-02-luna-high-1794075940-wf-agentstream-wf-02-cursor-lunahigh.md) (**split signal** — **8** green tests uncommitted; close-out blocked; orchestrator `exit_code: 0`) |
| PROMPT-WF-03 | Cursor agentstream / GPT-5.6 Luna high | `1794079067-wf-agentstream-wf-03-cursor-lunahigh` (`HARNESS=cursor`; orchestrator process log; **~4 min** runtime; no REQ working folder; first **luna-high** WF-03) | [Cursor readout](trial-readout-PROMPT-WF-03-luna-high-1794079067-wf-agentstream-wf-03-cursor-lunahigh.md) (**phase-1 identity failure** — orchestrator `exit_code: 0`; bootstrap **`54196ca`** only) |
| PROMPT-WF-04 | Cursor agentstream / GPT-5.6 Luna high | `1794079332-wf-agentstream-wf-04-cursor-lunahigh` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; first **luna-high** WF-04) | [Cursor readout](trial-readout-PROMPT-WF-04-luna-high-1794079332-wf-agentstream-wf-04-cursor-lunahigh.md) (**workflow incomplete** — scaffold only; **0** tests; close-out blocked; orchestrator `exit_code: 0`) |
| PROMPT-WF-05 | Cursor agentstream / GPT-5.6 Luna high | `1794079974-wf-agentstream-wf-05-cursor-lunahigh` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; pairs [luna-med @ 1794052043](trial-readout-PROMPT-WF-05-luna-med-1794052043-wf-agentstream-wf-05-cursor-lunamed.md)) | [Cursor readout](trial-readout-PROMPT-WF-05-luna-high-1794079974-wf-agentstream-wf-05-cursor-lunahigh.md) (**split signal** — **8** green tests uncommitted; close-out blocked; orchestrator `exit_code: 0`; bootstrap-only git) |
| PROMPT-WF-06 | Cursor agentstream / GPT-5.6 Luna high | `1794081715-wf-agentstream-wf-06-cursor-lunahigh` (`HARNESS=cursor`; orchestrator process log; `WritableIterable` launch noise; first **luna-high** WF-06) | [Cursor readout](trial-readout-PROMPT-WF-06-luna-high-1794081715-wf-agentstream-wf-06-cursor-lunahigh.md) (**workflow incomplete** — **5** green tests uncommitted; orchestrator `exit_code: 1`; turn 4 absent) |
| PROMPT-WF-07 | Cursor agentstream / GPT-5.6 Luna high | `1794086713-wf-agentstream-wf-07-cursor-lunahigh` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; null-clear rule; inventory skill fields null) | [Cursor readout](trial-readout-PROMPT-WF-07-luna-high-1794086713-wf-agentstream-wf-07-cursor-lunahigh.md) (**workflow complete** — four turns; **`8e1d9e9`**; **4** tests; close-out gate pass; orchestrator `exit_code: 0`) |
| PROMPT-WF-08 | Cursor agentstream / GPT-5.6 Luna high | `1794088871-wf-agentstream-wf-08-cursor-lunahigh` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology capture **4.2.1**; first **luna-high** WF-08) | [Cursor readout](trial-readout-PROMPT-WF-08-luna-high-1794088871-wf-agentstream-wf-08-cursor-lunahigh.md) (**split signal** — four turns; orchestrator `exit_code: 0`; **0** tests; close-out blocked; bootstrap **`8da3f03`** only) |
| PROMPT-WF-03 | Cursor agentstream / GPT-5.6 Luna high | `1794093680-wf-agentstream-wf-03-cursor-lunahigh` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-03-luna-high-1794093680-wf-agentstream-wf-03-cursor-lunahigh.md) (**workflow incomplete** — refine/build blocked; **0** tests; orchestrator `exit_code: 0`; bootstrap **`05ba1f3`**; pairs [luna-high @ 1794079067](trial-readout-PROMPT-WF-03-luna-high-1794079067-wf-agentstream-wf-03-cursor-lunahigh.md)) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna low | `1794094975-wf-agentstream-wf-01-cursor-lunalow` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-low-1794094975-wf-agentstream-wf-01-cursor-lunalow.md) (**workflow incomplete** — build-plan pending; **0** tests; orchestrator `exit_code: 0`; first **luna-low** WF-01 on **4.2.1**) |
| PROMPT-WF-02 | Cursor agentstream / GPT-5.6 Luna low | `1794095569-wf-agentstream-wf-02-cursor-lunalow` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-02-luna-low-1794095569-wf-agentstream-wf-02-cursor-lunalow.md) (**workflow incomplete** — build **not_run**; close-out **blocked**; **0** tests; orchestrator `exit_code: 0`) |
| PROMPT-WF-03 | Cursor agentstream / GPT-5.6 Luna low | `1794095886-wf-agentstream-wf-03-cursor-lunalow` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-03-luna-low-1794095886-wf-agentstream-wf-03-cursor-lunalow.md) (**workflow incomplete** — build **not_completed**; close-out machine pass without product; **0** tests; orchestrator `exit_code: 0`) |
| PROMPT-WF-04 | Cursor agentstream / GPT-5.6 Luna low | `1794096361-wf-agentstream-wf-04-cursor-lunalow` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-04-luna-low-1794096361-wf-agentstream-wf-04-cursor-lunalow.md) (**split signal** — **7/7** green tests uncommitted; close-out **blocked**; orchestrator `exit_code: 0`) |
| PROMPT-WF-05 | Cursor agentstream / GPT-5.6 Luna low | `1794096774-wf-agentstream-wf-05-cursor-lunalow` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-05-luna-low-1794096774-wf-agentstream-wf-05-cursor-lunalow.md) (**workflow incomplete** — **5/5** tests uncommitted; close-out incomplete; orchestrator `exit_code: 0`) |
| PROMPT-WF-06 | Cursor agentstream / GPT-5.6 Luna low | `1794097458-wf-agentstream-wf-06-cursor-lunalow` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-06-luna-low-1794097458-wf-agentstream-wf-06-cursor-lunalow.md) (**split signal** — **5/5** green uncommitted; close-out **blocked**; orchestrator `exit_code: 0`) |
| PROMPT-WF-07 | Cursor agentstream / GPT-5.6 Luna low | `1794099967-wf-agentstream-wf-07-cursor-lunalow` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-07-luna-low-1794099967-wf-agentstream-wf-07-cursor-lunalow.md) (**split signal** — **3/3** tests uncommitted; close-out **blocked**; orchestrator `exit_code: 0`) |
| PROMPT-WF-08 | Cursor agentstream / GPT-5.6 Luna low | `1794100604-wf-agentstream-wf-08-cursor-lunalow` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-08-luna-low-1794100604-wf-agentstream-wf-08-cursor-lunalow.md) (**split signal** — **2/2** tests uncommitted; close-out **blocked**; first **luna-low** WF-08 on **4.2.1**; orchestrator `exit_code: 0`) |
| PROMPT-WF-01 | Claude agentstream / Claude Sonnet 5.5 | `1794101529-wf-agentstream-wf-01-claude-sonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Claude Sonnet readout](trial-readout-PROMPT-WF-01-claudesonnet55-1794101529-wf-agentstream-wf-01-claude-sonnet55.md) (**workflow complete** — **`3f8de04`**; **11/11** tests; REQ index **Planned**; orchestrator `exit_code: 0`) |
| PROMPT-WF-02 | Claude agentstream / Claude Sonnet 5.5 | `1794101881-wf-agentstream-wf-02-claude-sonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Claude Sonnet readout](trial-readout-PROMPT-WF-02-claudesonnet55-1794101881-wf-agentstream-wf-02-claude-sonnet55.md) (**split signal** — **18/18** tests uncommitted; close-out blocked on adversarial inquiry; orchestrator `exit_code: 0`) |
| PROMPT-WF-03 | Claude agentstream / Claude Sonnet 5.5 | `1794102131-wf-agentstream-wf-03-claude-sonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Claude Sonnet readout](trial-readout-PROMPT-WF-03-claudesonnet55-1794102131-wf-agentstream-wf-03-claude-sonnet55.md) (**workflow complete** — **`bc722e8`**; **9/9** tests; orchestrator `exit_code: 0`) |
| PROMPT-WF-04 | Claude agentstream / Claude Sonnet 5.5 | `1794102400-wf-agentstream-wf-04-claude-sonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Claude Sonnet readout](trial-readout-PROMPT-WF-04-claudesonnet55-1794102400-wf-agentstream-wf-04-claude-sonnet55.md) (**workflow complete** — **`4b09c91`**; **7/7** tests; pairs [incomplete @ 1793852946](trial-readout-PROMPT-WF-04-claudesonnet55-1793852946-wf-agentstream-wf-04-claude-claudesonnet55.md)) |
| PROMPT-WF-05 | Claude agentstream / Claude Sonnet 5.5 | `1794102708-wf-agentstream-wf-05-claude-sonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Claude Sonnet readout](trial-readout-PROMPT-WF-05-claudesonnet55-1794102708-wf-agentstream-wf-05-claude-sonnet55.md) (**workflow incomplete** — **22/22** tests uncommitted; close-out blocked; orchestrator `exit_code: 0`) |
| PROMPT-WF-06 | Claude agentstream / Claude Sonnet 5.5 | `1794102962-wf-agentstream-wf-06-claude-sonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Claude Sonnet readout](trial-readout-PROMPT-WF-06-claudesonnet55-1794102962-wf-agentstream-wf-06-claude-sonnet55.md) (**workflow complete** — **`b7c0e1d`**; **10/10** tests; REQ index **Planned**; orchestrator `exit_code: 0`) |
| PROMPT-WF-07 | Claude agentstream / Claude Sonnet 5.5 | `1794103222-wf-agentstream-wf-07-claude-sonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Claude Sonnet readout](trial-readout-PROMPT-WF-07-claudesonnet55-1794103222-wf-agentstream-wf-07-claude-sonnet55.md) (**workflow complete** — **`23a655e`**; **23/23** tests; REQ **Implemented**; orchestrator `exit_code: 0`) |
| PROMPT-WF-08 | Claude agentstream / Claude Sonnet 5.5 | `1794103645-wf-agentstream-wf-08-claude-sonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Claude Sonnet readout](trial-readout-PROMPT-WF-08-claudesonnet55-1794103645-wf-agentstream-wf-08-claude-sonnet55.md) (**workflow complete** — **`bec9000`**; **5/5** tests; REQ **Implemented**; pairs [1794069919](trial-readout-PROMPT-WF-08-claudesonnet55-1794069919-wf-agentstream-wf-08-claude-sonnet55.md)) |
| PROMPT-WF-01 | Cursor agentstream / Grok 4.7 medium | `1794181275-wf-agentstream-wf-01-cursor-grok47med` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**; first **grok47-med** WF-01) | [Cursor readout](trial-readout-PROMPT-WF-01-grok47-med-1794181275-wf-agentstream-wf-01-cursor-grok47med.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`6c0ab53`**; **7/7** tests) |
| PROMPT-WF-02 | Cursor agentstream / Grok 4.7 medium | `1794183415-wf-agentstream-wf-02-cursor-grok47med` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-02-grok47-med-1794183415-wf-agentstream-wf-02-cursor-grok47med.md) (**workflow complete** — **`e94d560`**; **8/8** tests) |
| PROMPT-WF-03 | Cursor agentstream / Grok 4.7 medium | `1794188384-wf-agentstream-wf-03-cursor-grok47med` (`HARNESS=cursor`; **isolated re-run** after batch abort `1794185608`; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-03-grok47-med-1794188384-wf-agentstream-wf-03-cursor-grok47med.md) (**workflow complete** — **`b758ff0`**; **9/9** tests) |
| PROMPT-WF-04 | Cursor agentstream / Grok 4.7 medium | `1794191005-wf-agentstream-wf-04-cursor-grok47med` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-04-grok47-med-1794191005-wf-agentstream-wf-04-cursor-grok47med.md) (**workflow complete** — **`de385e7`**; **11/11** tests) |
| PROMPT-WF-05 | Cursor agentstream / Grok 4.7 medium | `1794195336-wf-agentstream-wf-05-cursor-grok47med` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-05-grok47-med-1794195336-wf-agentstream-wf-05-cursor-grok47med.md) (**workflow complete** — **`5a18760`**; **13/13** tests) |
| PROMPT-WF-06 | Cursor agentstream / Grok 4.7 medium | `1794197658-wf-agentstream-wf-06-cursor-grok47med` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-06-grok47-med-1794197658-wf-agentstream-wf-06-cursor-grok47med.md) (**workflow complete** — **`230d655`**; **5/5** tests) |
| PROMPT-WF-07 | Cursor agentstream / Grok 4.7 medium | `1794200222-wf-agentstream-wf-07-cursor-grok47med` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**) | [Cursor readout](trial-readout-PROMPT-WF-07-grok47-med-1794200222-wf-agentstream-wf-07-cursor-grok47med.md) (**workflow complete** — **`0b6a3c2`**; **8/8** tests) |
| PROMPT-WF-08 | Cursor agentstream / Grok 4.7 medium | `1794202372-wf-agentstream-wf-08-cursor-grok47med` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**; first **grok47-med** WF-08) | [Cursor readout](trial-readout-PROMPT-WF-08-grok47-med-1794202372-wf-agentstream-wf-08-cursor-grok47med.md) (**workflow complete** — **`c46b459`**; **5/5** tests) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794205559-wf-agentstream-wf-01-cursor-composer25` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; batch **1794205***) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25-1794205559-wf-agentstream-wf-01-cursor-composer25.md) (**workflow complete** — **`85e8127`**; **12/12** tests) |
| PROMPT-WF-02 | Cursor agentstream / Composer 2.5 | `1794206410-wf-agentstream-wf-02-cursor-composer25` (`HARNESS=cursor`; session **4.2.1**; batch **1794205***) | [Cursor readout](trial-readout-PROMPT-WF-02-composer25-1794206410-wf-agentstream-wf-02-cursor-composer25.md) (**workflow complete** — **`1678751`**; **10/10** tests) |
| PROMPT-WF-03 | Cursor agentstream / Composer 2.5 | `1794207497-wf-agentstream-wf-03-cursor-composer25` (`HARNESS=cursor`; session **4.2.1**; batch **1794205***) | [Cursor readout](trial-readout-PROMPT-WF-03-composer25-1794207497-wf-agentstream-wf-03-cursor-composer25.md) (**workflow complete** — feature **`cd1e24c`**; HEAD **`fd88ea0`**; **8/8** tests) |
| PROMPT-WF-04 | Cursor agentstream / Composer 2.5 | `1794208361-wf-agentstream-wf-04-cursor-composer25` (`HARNESS=cursor`; session **4.2.1**; batch **1794205***) | [Cursor readout](trial-readout-PROMPT-WF-04-composer25-1794208361-wf-agentstream-wf-04-cursor-composer25.md) (**workflow complete** — **`856dab8`**; **10/10** tests) |
| PROMPT-WF-05 | Cursor agentstream / Composer 2.5 | `1794209213-wf-agentstream-wf-05-cursor-composer25` (`HARNESS=cursor`; session **4.2.1**; batch **1794205***) | [Cursor readout](trial-readout-PROMPT-WF-05-composer25-1794209213-wf-agentstream-wf-05-cursor-composer25.md) (**workflow complete** — **`7db4818`**; **9/9** tests) |
| PROMPT-WF-06 | Cursor agentstream / Composer 2.5 | `1794210060-wf-agentstream-wf-06-cursor-composer25` (`HARNESS=cursor`; session **4.2.1**; batch **1794205***) | [Cursor readout](trial-readout-PROMPT-WF-06-composer25-1794210060-wf-agentstream-wf-06-cursor-composer25.md) (**workflow complete** — **`a4f1cbc`**; **11/11** tests) |
| PROMPT-WF-07 | Cursor agentstream / Composer 2.5 | `1794210943-wf-agentstream-wf-07-cursor-composer25` (`HARNESS=cursor`; session **4.2.1**; batch **1794205***) | [Cursor readout](trial-readout-PROMPT-WF-07-composer25-1794210943-wf-agentstream-wf-07-cursor-composer25.md) (**workflow complete** — **`e4a0b09`**; **8/8** tests) |
| PROMPT-WF-08 | Cursor agentstream / Composer 2.5 | `1794211741-wf-agentstream-wf-08-cursor-composer25` (`HARNESS=cursor`; session **4.2.1**; batch **1794205***) | [Cursor readout](trial-readout-PROMPT-WF-08-composer25-1794211741-wf-agentstream-wf-08-cursor-composer25.md) (**split signal** — **`44569db`**; **4/4** tests; close_out **allowed** but process/adherence **partial**; dirty evidence tree) |
| PROMPT-WF-08 | Cursor agentstream / GPT-5.6 Luna low | `1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; session methodology **4.2.1**; isolated re-run) | [Cursor readout](trial-readout-PROMPT-WF-08-luna-low-1794231848-wf-agentstream-wf-08-cursor-gpt56lunalow.md) (**split signal** — **2/2** tests uncommitted; machine close-out **not_run**; orchestrator `exit_code: 0`; pairs [1794100604](trial-readout-PROMPT-WF-08-luna-low-1794100604-wf-agentstream-wf-08-cursor-lunalow.md)) |
| PROMPT-WF-03 | Cursor agentstream / Composer 2.5 | `1794263616-wf-agentstream-wf-03-cursor-composer25medium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-03-composer25medium-1794263616-wf-agentstream-wf-03-cursor-composer25medium.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`24a5f4a`**; **8/8** tests) |
| PROMPT-WF-03 | Cursor agentstream / Composer 2.5 | `1794264348-wf-agentstream-wf-03-cursor-composer25high` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-03-composer25high-1794264348-wf-agentstream-wf-03-cursor-composer25high.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`b5fdb21`**; **5/5** tests) |
| PROMPT-WF-02 | Cursor agentstream / GPT-5.6 Luna low | `1794255679-wf-agentstream-wf-02-cursor-lunalowmedium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-02-luna-low-medium-1794255679-wf-agentstream-wf-02-cursor-lunalowmedium.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`718032b`**; **6/6** tests) |
| PROMPT-WF-02 | Claude agentstream / Claude Haiku 5.5 | `1794255744-wf-agentstream-wf-02-claude-haiku55medium` (`HARNESS=claude`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Claude readout](trial-readout-PROMPT-WF-02-claudehaiku55medium-1794255744-wf-agentstream-wf-02-claude-haiku55medium.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`fc7e7f6`**; **11/11** tests) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794246289-wf-agentstream-wf-01-cursor-composer25` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25-1794246289-wf-agentstream-wf-01-cursor-composer25.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`90dac89`**; **12/12** tests) |
| PROMPT-WF-01 | Claude agentstream / Claude Haiku 5.5 | `1794249088-wf-agentstream-wf-01-claude-haiku55medium` (`HARNESS=claude`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Claude readout](trial-readout-PROMPT-WF-01-claudehaiku55medium-1794249088-wf-agentstream-wf-01-claude-haiku55medium.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`197fbf5`**; **31/31** tests) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794249821-wf-agentstream-wf-01-cursor-composer25medium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25medium-1794249821-wf-agentstream-wf-01-cursor-composer25medium.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`1e48c96`**; **10/10** tests) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794249984-wf-agentstream-wf-01-cursor-composer25medium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25medium-1794249984-wf-agentstream-wf-01-cursor-composer25medium.md) (**split signal** — orchestrator **`exit_code: 0`**; **`9688585`**; **0/0** tests) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794250166-wf-agentstream-wf-01-cursor-composer25medium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25medium-1794250166-wf-agentstream-wf-01-cursor-composer25medium.md) (**split signal** — orchestrator **`exit_code: 0`**; **`f00f2cd`**; **0/0** tests) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794250240-wf-agentstream-wf-01-cursor-composer25medium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25medium-1794250240-wf-agentstream-wf-01-cursor-composer25medium.md) (**split signal** — orchestrator **`exit_code: 0`**; **`1364bf5`**; **0/0** tests) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794256180-wf-agentstream-wf-01-cursor-composer25medium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25medium-1794256180-wf-agentstream-wf-01-cursor-composer25medium.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`24f7c77`**; **10/10** tests) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794256441-wf-agentstream-wf-01-cursor-composer25medium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25medium-1794256441-wf-agentstream-wf-01-cursor-composer25medium.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`69ea2bd`**; **7/7** tests) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794256511-wf-agentstream-wf-01-cursor-composer25medium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25medium-1794256511-wf-agentstream-wf-01-cursor-composer25medium.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`f3ec506`**; **7/7** tests) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794256625-wf-agentstream-wf-01-cursor-composer25medium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25medium-1794256625-wf-agentstream-wf-01-cursor-composer25medium.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`7b53997`**; **10/10** tests) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794256930-wf-agentstream-wf-01-cursor-composer25medium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25medium-1794256930-wf-agentstream-wf-01-cursor-composer25medium.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`6d9283e`**; **10/10** tests) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna low | `1794259375-wf-agentstream-wf-01-cursor-lunalowmedium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-low-medium-1794259375-wf-agentstream-wf-01-cursor-lunalowmedium.md) (**workflow complete (exit 2 postamble)** — orchestrator **`exit_code: 2`**; **`69acae9`**; **6/6** tests) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna low | `1794259573-wf-agentstream-wf-01-cursor-lunalowmedium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-low-medium-1794259573-wf-agentstream-wf-01-cursor-lunalowmedium.md) (**workflow complete (exit 2 postamble)** — orchestrator **`exit_code: 2`**; **`45e6c03`**; **5/5** tests) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna low | `1794259664-wf-agentstream-wf-01-cursor-lunalowmedium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-low-medium-1794259664-wf-agentstream-wf-01-cursor-lunalowmedium.md) (**workflow complete (exit 2 postamble)** — orchestrator **`exit_code: 2`**; **`2db5b23`**; **3/3** tests) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna low | `1794259796-wf-agentstream-wf-01-cursor-lunalowmedium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-low-medium-1794259796-wf-agentstream-wf-01-cursor-lunalowmedium.md) (**workflow complete (exit 2 postamble)** — orchestrator **`exit_code: 2`**; **`a74f364`**; **6/6** tests) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna low | `1794259987-wf-agentstream-wf-01-cursor-lunalowmedium` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-low-medium-1794259987-wf-agentstream-wf-01-cursor-lunalowmedium.md) (**workflow complete (exit 2 postamble)** — orchestrator **`exit_code: 2`**; **`458808f`**; **4/4** tests) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna low | `1794260880-wf-agentstream-wf-01-cursor-lunalow` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-low-1794260880-wf-agentstream-wf-01-cursor-lunalow.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`f802856`**; **4/4** tests) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna low | `1794261164-wf-agentstream-wf-01-cursor-lunalow` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-low-1794261164-wf-agentstream-wf-01-cursor-lunalow.md) (**split signal** — orchestrator **`exit_code: 0`**; **`c4f86c5`**; **0/0** tests) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna low | `1794261284-wf-agentstream-wf-01-cursor-lunalow` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-low-1794261284-wf-agentstream-wf-01-cursor-lunalow.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`415e670`**; **5/5** tests) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna low | `1794261316-wf-agentstream-wf-01-cursor-lunalow` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-low-1794261316-wf-agentstream-wf-01-cursor-lunalow.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`1e0d117`**; **3/3** tests) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna low | `1794261371-wf-agentstream-wf-01-cursor-lunalow` (`HARNESS=cursor`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**) | [Cursor readout](trial-readout-PROMPT-WF-01-luna-low-1794261371-wf-agentstream-wf-01-cursor-lunalow.md) (**workflow complete** — orchestrator **`exit_code: 0`**; **`55b7112`**; **4/4** tests) |
Maintained by **`@record-wf-trial`**.

---

## Appendix A — Interaction inventory schema

Minimum shape for `trial-workflow-interaction-inventory.v1.json`:

```json
{
  "schema": "trial-workflow-interaction-inventory.v1",
  "analysis_label": "traditional-workflow-trial.v1",
  "prompt_id": "PROMPT-WF-03",
  "model_config": "luna-med",
  "model_slug": "<exact Cursor model id>",
  "tied_methodology_version": "4.2.0",
  "tied_methodology_version_source": "version_file",
  "sponsor_turns": [
    { "skill": "add-feature", "ordinal": 1 },
    { "skill": "refine-plan", "ordinal": 2 },
    { "skill": "build-plan", "ordinal": 3 },
    { "skill": "close-out", "ordinal": 4 }
  ]
}
```

Optional top-level: `tied_methodology_version`, `tied_methodology_version_source` (mirror of `evidence/tied-methodology-version.session.v1.json` when turn 1 captured semver).

Optional per turn: `commit_sha_after`, `mcp_tools`, `notes`, `iso_timestamp`.

Canonical session semver file: `tied-project/working/{REQ-TOKEN}/evidence/tied-methodology-version.session.v1.json` — see [trial-session-methodology-version-capture.md](../../tools/bundled-prompt-type-skills/prompt-shared/trial-session-methodology-version-capture.md).

**Proof boundary:** `facilitator_session_reconstruction` — documents turns and tool names for cohort compilation, not full chat transcripts.

---

## Related references

- [Demos index](README.md)
- [Greenfield prompt catalog](catalog-greenfield-plan-new-feature-prompts.md) — single-session trials
- [TIED compact demo tool catalog](catalog-tied-compact-tools.md)
- [New-client adherence runbook](../pseudocode-new-client-tied-adherence-runbook.md)
- [`@record-wf-trial` skill](../../tools/bundled-record-wf-trial-skill/SKILL.md)
