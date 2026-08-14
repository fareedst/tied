# I added TIED to an existing codebase. Here's the brownfield workflow.

*Draft Reddit post — r/programming / r/ExperiencedDevs tone.*

---

Most specification-first methods assume a blank repository. Ours wasn't blank. It already had production code, tests, terminology, and a backlog of decisions living in people's heads.

We added **TIED** — Token-Integrated Engineering & Development — without pretending the project was greenfield. TIED gives us a traceability chain:

```text
requirements (what and why)
  -> architecture decisions (boundaries and trade-offs)
  -> implementation decisions (behavior and pseudo-code)
  -> tests
  -> production code
```

The important brownfield trick is that the first pass runs in the opposite direction:

```text
passing tests + production behavior
  -> requirements
  -> architecture
  -> implementation pseudo-code
```

That is documentation and traceability work, not a license to rewrite working code.

## 1. Install TIED without trampling the project

Clone the TIED methodology repository somewhere stable. From that checkout, build the MCP server first:

```bash
export TIED_SOURCE="/path/to/tied"
export CLIENT="/path/to/existing-project"

(cd "$TIED_SOURCE/mcp-server" && npm install && npm run build)
"$TIED_SOURCE/copy_files.sh" "$CLIENT"
```

The current bootstrap requires the built `mcp-server/dist/index.js`, even if you plan to use the command-line wrapper later.

For an existing client that needs new inherited vocabulary files:

```bash
"$TIED_SOURCE/copy_files.sh" --merge-vocab "$CLIENT"
```

That is additive for `tied/vocab/*.md`: absent filenames are added and existing glossary files are preserved. It still performs the normal methodology refresh.

### Know what is yours and what is inherited

The bootstrap creates the structure, but it deliberately separates ownership:

- **Project YAML** — your records in `tied/requirements.yaml`, `tied/architecture-decisions.yaml`, `tied/implementation-decisions.yaml`, `tied/semantic-tokens.yaml`, and their detail directories. These are created when missing and are not overwritten.
- **Methodology YAML** — inherited records under `tied/methodology/`. This tree is read-only in the client and is refreshed from the TIED templates.
- **Guides** — files under `tied/docs/` are copied when missing, so customized client docs are retained for deliberate comparison and merging.
- **Managed skills** — `.cursor/skills/tied-yaml/`, the prompt-type skills, and shared prompt references are refreshed by the bootstrap. Unrelated client skills remain alone.
- **Vocabulary** — seeded when the client has no Markdown glossaries; with `--merge-vocab`, only missing glossary basenames are added.
- **Root guidance** — `AGENTS.md` and `.cursorrules` are created only when missing.

One easy-to-miss detail: `.cursor/mcp.json` is created only when it does not exist. If it already exists, `copy_files.sh` preserves it byte-for-byte; it does not merge or repair the TIED entry. Treat an existing config as client-owned and inspect its `command`, `args`, and `TIED_BASE_PATH` intentionally.

From the client root, enable the server in Cursor:

```bash
cd "$CLIENT"
agent mcp enable tied-yaml
```

Approve the project MCP configuration when prompted, then type `quit` to leave the Agent CLI.

Verify the active project before reading or writing records:

```bash
export TIED_BASE_PATH="$CLIENT/tied"
export TIED_MCP_BIN="$TIED_SOURCE/mcp-server/dist/index.js"

"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  tied_config_get_base_path '{}'
```

The reported path must be the `tied/` directory of this client. Multiple TIED repositories on disk make a wrong base path surprisingly easy to miss.

## 2. Register the implementation that already exists

Don't start by inventing a hundred records or copying every source file into a YAML description. Register one module or workflow at a time.

### First, preload the vocabulary

Read [`tied/vocab/routing.md`](../tied/vocab/routing.md) before reading TIED records, source, or tests. Match the task keywords and open only the relevant glossaries:

- [`tied-methodology.md`](../tied/vocab/tied-methodology.md) for layout, project YAML, bootstrap, and methodology boundaries.
- [`tied-yaml-mcp.md`](../tied/vocab/tied-yaml-mcp.md) for MCP, `tied-cli`, base paths, and validation.
- [`pseudocode-and-citdp.md`](../tied/vocab/pseudocode-and-citdp.md) for brownfield pseudo-code, CITDP, and three-way alignment.

This sounds fussy until a project has three names for the same concept. TIED calls the four vocabulary actions **RESOLVE**, **PRELOAD**, **RECORD**, and **VALIDATE**:

1. **RESOLVE** ambiguous sponsor or code terminology to one preferred term.
2. **PRELOAD** the matched glossary before impact discovery.
3. **RECORD** new terms and naming bridges while the decision is fresh.
4. **VALIDATE** names across records, pseudo-code, tests, code, and docs before commit.

### Then inventory before authoring

Establish a baseline: which tests pass, which modules are in scope, and which behavior is actually supported. The TIED tools can inspect the existing tree:

```bash
"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  tied_import_summary '{}'

"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  yaml_index_list_tokens '{"index":"requirements"}'

"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  yaml_detail_read_many '{"type":"implementation"}'
```

Use scoped analysis when available for a bounded source/test path: a walk summary, token scan, gap report, and traceability-gap report are more useful than asking an agent to reread the entire repository. There is no general “convert this codebase into TIED” button. Import tools report structure; humans and agents still decide what behavior deserves a requirement.

For each module, make a small inventory:

- production files and meaningful functions;
- tests and the behavior they prove;
- existing `[REQ-*]`, `[ARCH-*]`, and `[IMPL-*]` comments;
- external boundaries, dependencies, and shared state;
- missing or stale implementation pseudo-code;
- unit, integration, composition, or genuinely E2E-only testability.

### Build the chain from evidence

Create records in this order:

1. **REQ** — state observable behavior and why it matters. Derive satisfaction and validation criteria from tests, user behavior, and project docs. Keep implementation mechanics out of the requirement.
2. **ARCH** — record stable module boundaries, ownership, data flow, dependencies, and alternatives evidenced by the current implementation.
3. **IMPL** — describe meaningful workflows and decisions, not merely a list of files. Record `code_locations`, tests, dependencies, composition, and testability.

For new records, prefer one tool call that creates the index row and detail file:

```bash
"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  tied_token_create_with_detail @/tmp/req-or-arch-or-impl.json
```

Register each new token in the project's `tied/semantic-tokens.yaml` as well. Keep the token suffix, record name, glossary term, pseudo-code block name, and test/code identifiers aligned. Use small `yaml_index_update` or `yaml_detail_update` payloads for existing records. For several related updates, preview them first:

```bash
"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  yaml_updates_apply @/tmp/ordered-updates.json
```

Use the tool's `dry_run` option before applying a batch. Arrays replace the existing array, so don't send a partial replacement accidentally.

### Make the IMPL sidecar the useful part

The IMPL detail is where the behavior becomes executable intent. For an existing implementation:

- start from the tests: inputs, outputs, effects, edge cases, and failures;
- cross-check production branches, ordering, delegation, and shared data;
- write language-agnostic pseudo-code in `tied/implementation-decisions/IMPL-<TOKEN>-pseudocode.md`;
- give every logical block a token comment and a description of how it implements the requirement;
- copy each block lead literally into the matching test and production comment.

Use `impl_detail_set_essence_pseudocode` through `tied-cli.sh` for a sidecar file, or edit the plain Markdown sidecar directly and validate afterward. Do not put a giant escaped pseudo-code string into an unrelated YAML update.

Because this is brownfield work, do not manufacture failing tests just to satisfy a greenfield TDD narrative. If the baseline tests already pass, document that baseline and reverse-document the behavior. Future behavior changes return to the normal TIED order: complete pseudo-code, write a failing test, then change production code.

Finish the registration pass with:

```bash
"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  yaml_index_validate '{}'

"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  tied_validate_consistency '{}'
```

Also run the project's tests and `./scripts/validate_tokens.sh` when it exists. In a verification-gated project, use `tied_verify` after tests so statuses come from evidence instead of being hand-edited.

## 3. Use the installed skills from then on

The bootstrap installs two related skill groups:

- `.cursor/skills/tied-yaml/` — the TIED YAML skill, `SKILL.md`, tool reference, and `scripts/tied-cli.sh`.
- `.cursor/skills/` — explicit Prompt Composer skills such as `plan-new-feature`, `refine-plan`, `build-plan`, `debug`, `plan-close-out`, `use-skill`, `leap-ad-hoc`, `leap-diff-promote`, `non-tied-plan`, `non-tied-debug`, and `prompt-type-router`.

The `.cursor/agents/` Task wrappers in the TIED source repository are development artifacts; they are not copied into clients. The client distribution path is `.cursor/skills/`.

All prompt-type skills are explicit-only. Choose the workflow instead of expecting the router to infer one from vague language:

- `@plan-new-feature` for a new requirement or behavior change;
- `@refine-plan` when there is a plan to improve;
- `@build-plan` when an approved plan is ready to execute;
- `@debug` for a failure investigation;
- `@plan-close-out` to synchronize TIED, evidence, release notes, and a proposed commit;
- `@non-tied-plan` or `@non-tied-debug` for ordinary client-local work that must not write TIED records;
- `@prompt-type-router` when you explicitly want an ordered composition such as `refine-plan, build-plan`.

For every TIED change, use the per-request checklist from `tied/docs/agent-req-implementation-checklist.md`: bootstrap context, define the change, discover impact, author or verify REQ/ARCH/IMPL, validate pseudo-code, test, implement, synchronize, and close out. The skill is a workflow guide, not an autonomous Git operator: it does not automatically inspect Git, stage, commit, amend, push, or access the clipboard.

The daily loop is now pleasantly repetitive:

```text
route vocabulary
  -> confirm TIED_BASE_PATH
  -> read related REQ/ARCH/IMPL
  -> update project YAML through MCP or tied-cli
  -> validate pseudo-code and TIED consistency
  -> tests first, then code
  -> LEAP back to IMPL when evidence changes the behavior
  -> update ARCH/REQ if the scope changed
```

Never write client-specific records under `tied/methodology/`. For project YAML, use the TIED YAML MCP or the installed `tied-cli.sh`; the plain-text IMPL pseudo-code sidecar and domain vocabulary Markdown are the intentional exceptions. Run `lint_yaml` on changed YAML and finish with `tied_validate_consistency`.

## What I would tell my past self

- Install the methodology before trying to organize the codebase.
- Build the MCP server before running `copy_files.sh`.
- Verify the base path before the first write.
- Start with one module and passing tests, not a repository-wide taxonomy.
- Treat REQ/ARCH/IMPL as a connected chain, not three independent folders.
- Use the sidecar for behavior and the glossary for names; don't turn either into a copy of the source tree.
- Let LEAP surface disagreements early: update IMPL first, then tests, then code.

The payoff is not that the old code suddenly becomes “spec-driven.” The payoff is that its intent becomes inspectable, and the next change has a smaller, safer place to start.

## TL;DR

1. Build TIED's MCP server and run `copy_files.sh` against the existing project.
2. Preserve project YAML; refresh only inherited methodology and managed skills.
3. Confirm the client's `TIED_BASE_PATH`.
4. Use tests and production behavior as evidence to register REQ → ARCH → IMPL.
5. Put detailed behavior in token-commented IMPL sidecars and register every semantic token.
6. Use explicit TIED skills for each future change, with `tied-cli.sh` for YAML and `tied_validate_consistency` at the end.

Further reading: [`tied/docs/methodology-migration.md`](../tied/docs/methodology-migration.md) · [`tied/docs/adding-tied-mcp-and-invoking-passes.md`](../tied/docs/adding-tied-mcp-and-invoking-passes.md) · [`tied/docs/client-development-index.md`](../tied/docs/client-development-index.md) · [`tied/vocab/routing.md`](../tied/vocab/routing.md)
