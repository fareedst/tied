# record-wf-trial — reference

## Invocation remainder

```text
@record-wf-trial <client-path-or-id> [--force] [--skip-feedback-ingest] [--prompt PROMPT-WF-NN] [--model-config composer-2.5|luna-low|luna-med|luna-high] [--orchestrator-log-dir ABS_PATH]
```

| Flag | Effect |
| --- | --- |
| `--force` | Allow republish when `trial-readout-PROMPT-WF-*-{id}.md` already exists |
| `--skip-feedback-ingest` | Readout + catalogs only; no store `tied_feedback_add`. Readout must state ingest **N/A** |
| `--prompt PROMPT-WF-NN` | Override auto-discovery from client PLAN headers |
| `--model-config` | Override or confirm model config id when PLAN header is ambiguous |
| `--orchestrator-log-dir` | Directory with `wf-trial-orchestrator-run.v1.json` or `process.{stdout,stderr}.log` when logs were copied off-client |

## Client root resolution

| Input | Resolution |
| --- | --- |
| Absolute path | Normalize; require `{path}/tied-project/` directory |
| Numeric id (e.g. `1792857852`) | `{TIED_GF_TRIAL_CLIENTS_ROOT}/{id}` or `{TIED_WF_TRIAL_CLIENTS_ROOT}/{id}` |

**`TIED_GF_TRIAL_CLIENTS_ROOT`:** sponsor-local disposable clients root (primary).

**`TIED_WF_TRIAL_CLIENTS_ROOT`:** optional alias with the same semantics.

Document a default example in operator notes only (e.g. `~/Documents/dev/test`); do not hard-code user home paths in automation.

**`TIED_STORE_ROOT`:** store repo root for links inside readout (optional env for prose).

## Facilitator verification env (subject client)

```bash
export TIED_BASE_PATH="{client}/tied-project"
export TIED_METHODOLOGY_BUNDLE_PATH="{client}/tied-bundle"
export TIED_STORE_ROOT="{store repo root}"
```

| Command | Capture |
| --- | --- |
| `git log -1 --format=%H` @ client root | HEAD pin |
| `npm test` (default for orchestrated WF trials — TypeScript stack) or project test script | stdout summary (counts) |
| `npm run lint:ts` / `npx tsc -b` if present | pass/fail |
| `.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency` | full JSON file |
| Optional `tied_project_lint` | JSON summary |

## Orchestrator process log (default discovery)

When the trial used **`workflow_trial_agentstream`**, the client usually contains:

| Artifact | Path (under client root) |
| --- | --- |
| Manifest | `tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json` |
| Stdout log | `…/process.stdout.log` |
| Stderr log | `…/process.stderr.log` |

Schema id: **`wf-trial-orchestrator-run.v1`**. Opt out at run time with **`WF_TRIAL_SKIP_PROCESS_LOG=1`**.

Readout: add **Orchestrator process log** (manifest path, `exit_code`, ≤12 friction bullets with log citations). When manifest is absent, state **N/A** and keep legacy “not transcript-grade” honesty only for non-orchestrator runs.

**Methodology learning readout** (catalog 9%): score when process logs exist; still no maturity_score / leaderboard.

## Readout document contract

Extends [record-gf-trial readout contract](../../tools/bundled-record-gf-trial-skill/reference.md#readout-document-contract-12-sections) with workflow-specific sections:

1. Metadata table — include **Model config**, **Model slug**, **Touchpoint** (`add-feature` → `refine-plan` → `build-plan` → `close-out` + facilitator inspection).
2. Sponsor intent (verbatim PROMPT-WF block).
3. RESOLVE table (subject client).
4. What was built.
5. Outcome record.
6. Completion signals (three-way).
7. TIED db capture + **Workflow inventory** (`trial-workflow-interaction-inventory.v1.json`) + cohort extras (`feedback.yaml`).
8. **Four-turn table** (skill × outcome).
9. **Orchestrator process log** (when manifest or `--orchestrator-log-dir`; else **N/A**).
10. **Phase boundary audit** (heuristic; document uncertainty).
11. **Stack compliance** (orchestrated cells): `implementation_stack_id` in inventory; TypeScript under `src/`; facilitator `npm test`; note waivers when `WF_TRIAL_SKIP_IMPLEMENTATION_STACK=1` or Python/alternate runner on disk.
12. Session grading — **seven dimensions** including **Workflow choreography** (see [catalog grading](../../docs/demos/catalog-traditional-workflow-trial-prompts.md#facilitator-grading-readout)).
13. **Cross-model notes** (same PROMPT-WF, other readouts if any — prose, no ranking).
14. Cohort comparisons vs peer WF readouts.
15. Optional TIED version / dogfood paragraph (not effectiveness claim).
16. Facilitator follow-ups.
17. Future-test rule.

**Filename pattern:** `docs/demos/trial-readout-PROMPT-WF-{NN}-{modelConfigSlug}-{clientId}.md`

Example: `trial-readout-PROMPT-WF-03-luna-med-1793000001.md`

## Feedback ingest modes (facilitator)

Same as [record-gf-trial — Feedback ingest modes](../../tools/bundled-record-gf-trial-skill/reference.md#feedback-ingest-modes-facilitator).

## Store operator install

From the TIED store repo root:

```bash
./tied-install.sh --allow-self-install --layers skills .
```

Installs linked stub at `.cursor/skills/record-wf-trial/SKILL.md` pointing at this bundle. **Not** installed on disposable clients via normal `test-new-tied-client` bootstrap.
