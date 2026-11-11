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
| `tied-cli.sh server_info '{}'` (when session evidence missing) | Snapshot `extensions.tied.methodology` to store facilitator evidence |

## Methodology version (session)

Readout **metadata table** must include **TIED methodology version (session)** (semver), **source**, and **evidence path** when resolvable. Section **TIED version / dogfood** (§15) cites the same resolution; not an effectiveness claim.

**Resolution order** (stop at first hit; label weaker sources):

1. `tied-project/working/*/evidence/tied-methodology-version.session.v1.json` on the subject client ([REQ-TRIAL_METHODOLOGY_VERSION_READOUT]).
2. `tied_methodology_version` and `tied_methodology_version_source` on `trial-workflow-interaction-inventory.v1.json` (WF mirror).
3. Facilitator-run `server_info` on the client (`TIED_BASE_PATH` scoped); archive JSON under store `FACILITATOR-WF-*/evidence/`.
4. `tied-bundle/install.json` → `store_methodology_version` — label **bootstrap pin** (not session MCP).
5. Earliest bootstrap git commit message — label **bootstrap-inferred only** when (1) is absent; do not treat as session capture.

When (1) is missing on pre-ship trials, state **bootstrap-inferred only** explicitly; `--force` republish is allowed.

Contract example: `mcp-server/contracts/trial-methodology-version/tied-methodology-version.session.example.json`. Agent capture: [trial-session-methodology-version-capture.md](../../tools/bundled-prompt-type-skills/prompt-shared/trial-session-methodology-version-capture.md).

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

1. Metadata table — include **Model config**, **Model slug**, **TIED methodology version (session)** (semver, source, evidence path), **Touchpoint** (`add-feature` → `refine-plan` → `build-plan` → `close-out` + facilitator inspection).
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
12. Session grading — **seven dimensions** including **Workflow choreography** (see [catalog grading](../../docs/demos/catalog-traditional-workflow-trial-prompts.md#facilitator-grading-readout)). **Rationale** column rules: [Session grading rationale](#session-grading-rationale) below.
13. **Cross-model notes** (same PROMPT-WF, other readouts if any — prose, no ranking).
14. Cohort comparisons vs peer WF readouts.
15. TIED version / dogfood paragraph — session resolution per **Methodology version (session)**; when only (4)/(5) apply, say **bootstrap-inferred only** (not effectiveness claim).
16. Facilitator follow-ups.
17. Future-test rule.

## Session grading rationale

[REQ-WF_TRIAL_READOUT_GRADING_RATIONALE] Facilitator prose for the **Rationale** column (item 12).

| Band | Write |
| --- | --- |
| **A** | One sentence (~12–30 words): cite **one concrete fact** from this readout (tests, `exit_code`, commit SHA, disposition). |
| **A−** … **F** | One sentence: state the **single main reason** it is not the next higher band for this dimension. |

**Process adherence preview:** Before publishing, flag **Process adherence** below **B** when the subject client lacks `tied-project/working/{REQ}/gates/close_out-*.json` while the readout claims machine close-out passed, or when `execution_evidence.completed` lists prompt-type slugs (`build-plan`, …) instead of checklist slugs.

**Style:** Plain language; prefer “req/architecture docs match tests” over raw **R+A+I** jargon; cite `exit_code` and test counts when present.

**Forbidden in rationale cells:** `maturity_score`, leaderboard language, multi-paragraph essays, unexplained acronyms.

**Examples (same trial):**

- **A** — Requirement interpretation: `Comparator scope and invalid-input rule locked in PLAN before RED tests.`
- **A−** — Test strategy: `RED/GREEN archived with nine cases, leaner than the seventeen-case peer readout on the same prompt.`

**Allowed:** one markdown link to a peer readout when comparing test depth.

**Regression:** `node --test tools/bootstrap/lib/trial-readout-grading-rationale-contract.test.mjs`

## Project size layers

[REQ-TIED_PROJECT_SIZE_LAYERS] Evidence-only appendix — **not** a grade dimension and **not** a maturity score.

| Step | Action |
| --- | --- |
| Snapshot | MCP `tied_project_size_snapshot` with `repo_root` = subject client root (read-only). |
| Evidence | Optional archive: `tied-project/working/{REQ}/evidence/project-size-snapshot.v1.json` on subject or store facilitator folder. |
| Readout | Add **Project size layers** subsection under **What was built** or **Cohort comparisons**: cite `layers.atoms`, `layers.operational_intent`, `layers.proof_facets`, `hashes.operational_intent_hash`, and receipt `proof_boundary`. |
| Cohort JSONL | Append via tooling only: [`tied-bundle/reports/wf-trial-cohort/runs.jsonl`](../../tied-bundle/reports/wf-trial-cohort/runs.jsonl) — human metric policy: [`tied-project/config/project-size-metrics.registry.yaml`](../../tied-project/config/project-size-metrics.registry.yaml). Catalog: [catalog-tied-size-and-trial-statistics.md](../../docs/demos/catalog-tied-size-and-trial-statistics.md). |

### Proof labels (dissection)

[REQ-WF_TRIAL_COMPOSITION_EVIDENCE_SUBCHECK] For **PROMPT-WF-09..12**, run MCP `tied_trial_composition_evidence_subcheck` on the subject client (`repo_root`, optional `prompt_id`, optional `manifest_path`). Place the subsection **beside** the size receipt `comp` column prose — not instead of it.

| Step | Action |
| --- | --- |
| Subcheck | MCP `tied_trial_composition_evidence_subcheck` → `wf-composition-evidence-subcheck.v2` payload |
| Readout | Paste `label_histogram_markdown` table; cite `composition_evidence_subcheck`, `binding_test_present`, `receipt_composition_declared`, `receipt_composition_inferred`, manifest flags when present |
| Test strategy rationale | May cite label vs facilitator judgment mismatch; **evidence append only** — no auto band rewrite (v1) |

Template: [`tied-bundle/templates/wf-composition-evidence-subcheck.v2.template.json`](../../tied-bundle/templates/wf-composition-evidence-subcheck.v2.template.json).

**Forbidden in proof labels subsection:** auto-rewriting Session grading bands from subcheck alone; treating histogram as maturity score.

**Forbidden in size appendix:** leaderboard language, ranking models, implying snapshot proves REQ **Implemented** status.

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
