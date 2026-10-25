# record-gf-trial — reference

## Invocation remainder

```text
@record-gf-trial <client-path-or-id> [--force] [--skip-feedback-ingest] [--prompt PROMPT-GF-NN] [--custom]
```

| Flag | Effect |
| --- | --- |
| `--force` | Allow republish when `trial-readout-*-{id}.md` already exists |
| `--skip-feedback-ingest` | Readout + catalogs only; no store `tied_feedback_add`. Readout must state ingest **N/A** and must not imply a client-originated receipt when skipped |
| `--prompt PROMPT-GF-NN` | Override auto-discovery from client PLAN headers |
| `--custom` | Label trial as custom greenfield (not a catalog PROMPT-GF block) |

## Client root resolution

| Input | Resolution |
| --- | --- |
| Absolute path | Normalize; require `{path}/tied-project/` directory |
| Numeric id (e.g. `1792857852`) | `{TIED_GF_TRIAL_CLIENTS_ROOT}/{id}` |

**`TIED_GF_TRIAL_CLIENTS_ROOT`:** sponsor-local disposable clients root. Document a default example in operator notes only (e.g. `~/Documents/dev/test`); do not hard-code user home paths in automation.

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
| `npm test` or project test script | stdout summary (counts) |
| `npm run lint:ts` / `npx tsc -b` if present | pass/fail |
| `.cursor/skills/tied-yaml/scripts/tied-cli.sh tied_validate_consistency` | full JSON file |
| Optional `tied_project_lint` | JSON summary |

## Readout document contract (12 sections)

Mirror [FACILITATOR-GF-04 §2.4](../../tied-project/working/FACILITATOR-GF-04-1792857852/PLAN.md):

1. Metadata table (recorded date, touchpoint, catalog map, client root, HEAD, outcome headline).
2. Sponsor intent (verbatim PROMPT-GF block or reconstructed custom).
3. RESOLVE table (subject client).
4. What was built (modules, tests, fixtures, TIED stack paths, disturbance ladder).
5. Outcome record (implementation vs dimensioned grading summary).
6. Completion signals (three-way).
7. TIED db capture (client paths) + GF cohort extras (`feedback.yaml`, interaction inventory).
8. Session grading vs catalog (six dimensions + rationale).
9. Cohort comparisons vs peer readouts.
10. Optional TIED version / dogfood paragraph (not effectiveness claim).
11. Facilitator follow-ups (open vs done).
12. Future-test rule.

**Filename pattern:** `docs/demos/trial-readout-{PROMPT-GF-NN|CUSTOM-*}-{clientId}.md`

## Feedback ingest modes (facilitator)

| Mode | Who writes | Typical evidence | Close-out note |
| --- | --- | --- | --- |
| **Client-originated** | Sponsor **`/feedback`** or client agent with MCP receipt on client `TIED_BASE_PATH` | Client `tied/feedback.yaml` or store row after export/ingest; **receipt id** | Not the same as facilitator proxy |
| **Proxy store row** | Facilitator **`tied_feedback_add`** on **store** `tied-project/feedback.yaml` during readout (Track B class: tooling fix witness) | Store **`fb-*`** with readout `context` | Label as facilitator/proxy in readout — not client session capture |
| **`--skip-feedback-ingest`** | None | No new store row from step 11 | Readout documents **N/A**; e.g. GF-16 capture gap class **`fb-mvnyr5n2-aaeg1j`** until **`REQ-TIED_CLIENT_FEEDBACK_CAPTURE`** ships |

## Store operator install

From the TIED store repo root:

```bash
./tied-install.sh --allow-self-install --layers skills .
```

Installs linked stub at `.cursor/skills/record-gf-trial/SKILL.md` pointing at this bundle. **Not** installed on disposable clients via normal `test-new-tied-client` bootstrap.
