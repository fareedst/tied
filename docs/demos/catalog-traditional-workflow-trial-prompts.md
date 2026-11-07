# Catalog of traditional four-phase workflow trial prompts

| Field | Value |
| --- | --- |
| **Purpose** | Short **invocation remainders** for **`@add-feature`** in a **disposable client**, then **`@refine-plan`**, **`@build-plan`**, and **`@close-out`** as **separate sponsor turns**. Stresses **workflow choreography** and **LLM differences** (Composer 2.5, GPT-5.6 Luna low/med/high) while reusing compact product scopes. |
| **Audience** | Trial sponsors (paste text) · facilitators (grading + `@record-wf-trial`) |
| **Status** | Draft catalog |
| **Last updated** | 2026-11-04 |
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

Document in the client **`PLAN.md`** header and in `trial-workflow-interaction-inventory.v1.json`. Tooling does not enforce model choice.

| Config ID | Operator records exact slug in readout |
| --- | --- |
| `composer-2.5` | e.g. `composer-2.5-fast` |
| `luna-low` | GPT-5.6 Luna low tier |
| `luna-med` | GPT-5.6 Luna med tier |
| `luna-high` | GPT-5.6 Luna high tier |

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

---

## Facilitator grading readout

After the trial, score **separate dimensions**; do not collapse to one number. Weights below include **Workflow choreography** (not used in greenfield-only trials).

| Dimension | Weight | Facilitator inspects |
| --- | --- | --- |
| Requirement interpretation | 13% | Ambiguity resolved in writing; assumptions labeled |
| Traceability closure | 17% | Project decision records align with code and tests |
| Test strategy | 17% | RED in build-plan turn; disturbances where prompt implies |
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

---

## Recommended trial sequences (facilitator)

| Goal | Prompts × models |
| --- | --- |
| Pilot LLM matrix (12 runs) | PROMPT-WF-01, WF-03, WF-05 × `composer-2.5`, `luna-low`, `luna-med`, `luna-high` |
| Ambiguity + refine stress | PROMPT-WF-02 → PROMPT-WF-07 (separate clients) |
| Composition + gates | PROMPT-WF-03 then PROMPT-WF-06 |

---

## Recorded trials (facilitator)

| Prompt | Model config | Client | Readout |
| --- | --- | --- | --- |
| PROMPT-WF-01 | seven IDE + agentstream orchestrator | `1793483171-wf-01-*` … `1793560725-wf-01-muse-spark13-med`; `1793604353-wf-agentstream-wf-01` (`workflow-trial-agentstream wf-01`) | [IDE + agentstream comparison](wf-01-four-model-implementation-comparison.md) · [agentstream readout](trial-readout-PROMPT-WF-01-composer25-1793604353-wf-agentstream-wf-01.md) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794044147-wf-agentstream-wf-01-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; TIED **4.2.0** bootstrap) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md) (**workflow incomplete** — `exit_code: 1` after refine; machine pre_implementation pass; no product code) |
| PROMPT-WF-01 | Cursor agentstream / Composer 2.5 | `1794048393-wf-agentstream-wf-01-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; TIED **4.2.0** bootstrap; pairs with [1794044147](trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md)) | [Cursor readout](trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md) (**workflow complete** — orchestrator `exit_code: 0`; four turns; **`a2f82ac`**; REQ **Implemented**) |
| PROMPT-WF-01 | Cursor agentstream / GPT-5.6 Luna med | `1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; TIED **4.2.0** bootstrap pin) | [Cursor readout](trial-readout-PROMPT-WF-01-gpt56lunamediumfast-1794050603-wf-agentstream-wf-01-cursor-gpt56lunamediumfast.md) (**workflow incomplete** — orchestrator `exit_code: 1` after build-plan; **6** green tests uncommitted; close-out not run) |
| PROMPT-WF-02 | nine-model cohort | `1793562432-wf-02-composer25` … `1793592181-wf-02-claude-opus55-med` | [Nine-model comparison](wf-02-nine-model-implementation-comparison.md) + `trial-readout-PROMPT-WF-02-*` |
| PROMPT-WF-03 | agentstream orchestrator | `1793605811-wf-agentstream-wf-03` (`workflow-trial-agentstream wf-03`) | [agentstream readout](trial-readout-PROMPT-WF-03-composer25-1793605811-wf-agentstream-wf-03.md) |
| PROMPT-WF-03 | Claude Haiku 5.5 / agentstream | `1793815895-wf-agentstream-wf-03-claude-claudehaiku55` | [Claude readout](trial-readout-PROMPT-WF-03-claudehaiku55-1793815895-wf-agentstream-wf-03-claude-claudehaiku55.md) (build-plan on disk; **close-out incomplete**) |
| PROMPT-WF-03 | Cursor agentstream / Composer 2.5 | `1793817075-wf-agentstream-wf-03-cursor-composer25` (`HARNESS=cursor`) | [Cursor readout](trial-readout-PROMPT-WF-03-composer25-1793817075-wf-agentstream-wf-03-cursor-composer25.md) (full four-turn close-out; reconcile **not_run**) |
| PROMPT-WF-03 | Cursor agentstream / Composer 2.5 | `1793820250-wf-agentstream-wf-03-cursor-composer25` (`HARNESS=cursor`; orchestrator process log) | [Cursor readout](trial-readout-PROMPT-WF-03-composer25-1793820250-wf-agentstream-wf-03-cursor-composer25.md) (full four-turn close-out; RED archived; reconcile **not_run**) |
| PROMPT-WF-03 | Claude Haiku 5.5 / agentstream | `1793842935-wf-agentstream-wf-03-claude-claudehaiku55` (`HARNESS=claude`; orchestrator process log) | [Claude readout](trial-readout-PROMPT-WF-03-claudehaiku55-1793842935-wf-agentstream-wf-03-claude-claudehaiku55.md) (full four-turn close-out; RED archived; REQ index **Planned** drift; reconcile **not_run**) |
| PROMPT-WF-03 | Claude Sonnet 5.5 / agentstream | `1793848636-wf-agentstream-wf-03-claude-claudesonnet55` (`HARNESS=claude`; orchestrator process log) | [Claude Sonnet readout](trial-readout-PROMPT-WF-03-claudesonnet55-1793848636-wf-agentstream-wf-03-claude-claudesonnet55.md) (full four-turn close-out; Python unittest; REQ **Implemented**; reconcile **not_run**) |
| PROMPT-WF-04 | Cursor agentstream / Composer 2.5 | `1793851888-wf-agentstream-wf-04-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1** stack) | [Cursor readout](trial-readout-PROMPT-WF-04-composer25-1793851888-wf-agentstream-wf-04-cursor-composer25.md) (full four-turn close-out; fixture REQ scanner; index/detail status drift; reconcile **not_run**) |
| PROMPT-WF-04 | Claude Sonnet 5.5 / agentstream | `1793852946-wf-agentstream-wf-04-claude-claudesonnet55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1** stack) | [Claude Sonnet readout](trial-readout-PROMPT-WF-04-claudesonnet55-1793852946-wf-agentstream-wf-04-claude-claudesonnet55.md) (**close-out incomplete** — CITDP YAML missing; 14/14 tests uncommitted; pre_implementation blocked) |
| PROMPT-WF-04 | Claude Haiku 5.5 / agentstream | `1793853737-wf-agentstream-wf-04-claude-claudehaiku55` (`HARNESS=claude`; orchestrator process log; **wf-trial-ts-node-test-v1** stack) | [Claude Haiku readout](trial-readout-PROMPT-WF-04-claudehaiku55-1793853737-wf-agentstream-wf-04-claude-claudehaiku55.md) (machine close_out pass; CITDP YAML persisted; REQ **Proposed**; no gate receipt files; process **partial**) |
| PROMPT-WF-05 | Cursor agentstream / Composer 2.5 | `1794042383-wf-agentstream-wf-05-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1** stack) | [Cursor readout](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md) (**workflow incomplete** — orchestrator `exit_code: 1` at turn 2; refine AC locked on disk; no product code) |
| PROMPT-WF-05 | Cursor agentstream / Composer 2.5 | `1794049382-wf-agentstream-wf-05-cursor-composer25` (`HARNESS=cursor`; orchestrator process log; **wf-trial-ts-node-test-v1**; TIED **4.2.0** bootstrap; pairs with [1794042383](trial-readout-PROMPT-WF-05-composer25-1794042383-wf-agentstream-wf-05-cursor-composer25.md)) | [Cursor readout](trial-readout-PROMPT-WF-05-composer25-1794049382-wf-agentstream-wf-05-cursor-composer25.md) (**workflow complete** — orchestrator `exit_code: 0`; four turns; **`7ce3a12`**; REQ **Proposed** index drift) |

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
