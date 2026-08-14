# Starting a new project with TIED: the first twelve skill steps

*Draft Reddit post — r/programming / r/ExperiencedDevs tone.*

---

Most development workflows explain what to do after the code exists. This is about the awkward first day: an empty project, a user request, and an AI agent that needs enough structure to build something without inventing the rules as it goes.

I've been using **TIED** — Token-Integrated Engineering & Development — for that first day. It is not just a `tied/` directory full of YAML. It is a methodology that connects:

```text
vocabulary
  -> requirement
  -> architecture
  -> implementation pseudo-code
  -> tests
  -> production code
  -> validation and durable close-out
```

The example below is intentionally small: a language-agnostic `count-lines` CLI command. It accepts either stdin or a file and reports a deterministic line count. The point is not the command. The point is showing where the decisions, tests, code, and feedback go.

## First, install and confirm TIED

Assume you have:

- a TIED methodology checkout;
- Node.js 18 or newer;
- an empty or newly created client project;
- Cursor's `agent` CLI if you want to enable the project MCP configuration from the terminal.

From the TIED checkout, build the MCP server before bootstrapping the client:

```bash
export TIED_SOURCE="/path/to/tied"
export CLIENT="/path/to/count-lines-project"

(cd "$TIED_SOURCE/mcp-server" && npm install && npm run build)
"$TIED_SOURCE/copy_files.sh" "$CLIENT"
```

The current `copy_files.sh` requires the built `mcp-server/dist/index.js`. The server stays in the TIED repository; the client receives the TIED layout and skills, not a second copy of the server.

From the client root, enable the MCP server in Cursor:

```bash
cd "$CLIENT"
agent mcp enable tied-yaml
```

Approve the project MCP configuration when prompted, then type `quit`.

For terminal confirmation, make the paths explicit:

```bash
export TIED_BASE_PATH="$CLIENT/tied"
export TIED_MCP_BIN="$TIED_SOURCE/mcp-server/dist/index.js"

"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  tied_config_get_base_path '{}'

"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  yaml_index_list_tokens '{"index":"requirements"}'

"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  tied_validate_consistency '{}'
```

The first command must report the client's absolute `tied/` directory. The second should show the initial project index, which may be empty. The third confirms that the initial TIED graph is consistent.

In Cursor, also confirm that tools such as `yaml_index_read` and `tied_config_get_base_path` are available, and that the `tied://requirements` resource loads. If `.cursor/mcp.json` already exists, `copy_files.sh` preserves it byte-for-byte. If it does not exist, the script initializes it. It does not repair an existing configuration that points at the wrong project.

### What was installed?

The bootstrap creates or installs:

```text
count-lines-project/
├── AGENTS.md
├── .cursorrules
├── .cursor/
│   └── skills/
│       ├── tied-yaml/
│       ├── plan-new-feature/
│       ├── build-plan/
│       ├── debug/
│       └── ...
└── tied/
    ├── requirements.yaml
    ├── architecture-decisions.yaml
    ├── implementation-decisions.yaml
    ├── semantic-tokens.yaml
    ├── requirements/
    ├── architecture-decisions/
    ├── implementation-decisions/
    ├── methodology/
    ├── vocab/
    └── docs/
```

The project indexes and detail directories at the root of `tied/` are yours. `tied/methodology/` is inherited and read-only in a client; it is refreshed from TIED templates. The managed skills live under `.cursor/skills/`. Do not edit methodology YAML to add your application records.

## The example feature

Here is the deliberately boring request:

> Add a `count-lines` command. It reads stdin when no file is supplied, otherwise it reads one file, counts lines deterministically, prints the count, and returns a useful error for invalid input.

Non-goals:

- no recursive directory traversal;
- no editor integration;
- no UI;
- no language-specific implementation commitment in the requirement;
- no “while we're here” refactor of the whole project.

The example gives the agent enough behavior to specify without smuggling implementation details into the requirement.

## The twelve skill steps

These are explicit Cursor skill invocations, not shell commands. Each step has a visible handoff and a TIED gate behind it. In a real project, keep the per-request checklist Tracker in a working folder and record each completed step there.

### 1. Resolve the request

Invoke:

```text
@plan-new-feature Add a count-lines CLI command that reads stdin or one file and reports a deterministic line count.
```

You should get a clarified goal, terminology, boundaries, examples, and non-goals.

Behind the scenes, TIED runs the vocabulary **RESOLVE** touchpoint and the checklist's `translate-sponsor-intent` and `change-definition` work. Informal wording becomes a bounded change definition before it becomes a token name.

### 2. Bootstrap governed context

Continue the same workflow and explicitly ask it to perform session bootstrap:

```text
Follow the TIED session-bootstrap step. Confirm the routed vocabulary, project indexes, installed tied-yaml skill, and TIED_BASE_PATH before any YAML write.
```

The agent loads `AGENTS.md`, the TIED principles, `tied/vocab/routing.md`, matched glossaries, semantic tokens, and the relevant indexes. It confirms that this client—not another TIED checkout—is the write target.

This is where **PRELOAD** happens. The agent should know the canonical terms before it reads source, tests, or TIED records.

### 3. Create a request Tracker

Invoke:

```text
@use-skill Copy the TIED checklist Tracker for COUNT_LINES into a unique working file and use it for this request.
```

The Tracker is a per-request copy of `tied/docs/agent-req-implementation-checklist.yaml`. It records progress and loop-backs without turning the canonical methodology checklist into project state.

The durable output is not code. It is an honest checklist state that a later session can resume.

### 4. Discover impact and boundaries

Invoke:

```text
@plan-new-feature Build the impact map for COUNT_LINES. Identify the CLI entry point, counting module, test locations, module boundaries, risks, and applicable quality checks.
```

For a blank project, this is a design boundary rather than a code archaeology exercise. Define a thin entry point and a testable counting module. Decide whether stdin parsing, file reading, counting, and output formatting are separate units.

The hidden gates are `impact-discovery`, CITDP, and `[REQ-MODULE_VALIDATION]`: modules need boundaries and independent validation criteria before integration.

### 5. Author the requirement

Invoke:

```text
@plan-new-feature Create [REQ-COUNT_LINES] with observable acceptance and validation criteria for the count-lines behavior.
```

The result belongs in the client's project YAML:

```text
tied/requirements.yaml
tied/requirements/REQ-COUNT_LINES.yaml
tied/semantic-tokens.yaml
```

The requirement says what must be true and why. It should describe stdin, file input, deterministic output, and failure behavior without deciding whether the implementation uses a particular language or library.

The checklist gate is `author-requirement`: create the index row, detail file, and semantic-token entry through the TIED YAML tooling, then validate the YAML.

### 6. Record the architecture

Invoke:

```text
@plan-new-feature Define [ARCH-COUNT_LINES] as a thin CLI entry point over a testable counting module, linked to [REQ-COUNT_LINES].
```

The architecture decision records boundaries, data flow, ownership, and alternatives:

```text
CLI entry point
  -> input resolver
  -> line-counting module
  -> deterministic formatter
```

The architecture is still language-agnostic. It says where responsibilities live and what the seams are, not which source files or framework syntax must be used.

The hidden gate is `author-architecture`. If the architecture materially fixes paths or platform facts, the workflow may also update the optional `tied/agent-preload-contract.yaml` so later sessions do not rediscover them.

### 7. Write the implementation pseudo-code

Invoke:

```text
@plan-new-feature Author [IMPL-COUNT_LINES] pseudo-code for stdin/file selection, line counting, deterministic output, and failure handling. Include token comments and complete contracts.
```

The IMPL sidecar is the behavioral source of truth:

```text
# [IMPL-COUNT_LINES] [ARCH-COUNT_LINES] [REQ-COUNT_LINES]
# Selects one input source, counts lines deterministically, and returns a documented result or failure.

INPUT: optional file path or stdin stream
OUTPUT: count result or named failure
PRE: at most one file path is supplied
POST: success returns the count for the selected input
EFFECTS: IO
FAILURE_MODES: InvalidArguments, InputReadFailed

procedure COUNT_LINES(input):
  ...
```

Every logical block needs a comment naming the relevant REQ, ARCH, and IMPL tokens and explaining how the block implements them. New or changed Active procedure blocks also need `PRE`, `POST`, `EFFECTS`, and applicable failure, state-transition, or termination fields.

The hidden gates are `catalog-pseudocode-contracts`, `resolve-pseudocode`, and `[PROC-IMPL_PSEUDOCODE_TOKENS]`.

### 8. Validate and persist the implementation record

Invoke:

```text
@build-plan Validate the COUNT_LINES pseudo-code, persist the IMPL index/detail/sidecar, register its semantic token, and do not write tests or production code until the gate passes.
```

The agent performs the structural pseudo-code checks, then writes project-owned TIED data through the installed `tied-cli.sh` or the in-editor TIED YAML MCP. Large pseudo-code bodies belong in the `IMPL-COUNT_LINES-pseudocode.md` sidecar rather than a giant escaped YAML update.

This is the implementation freeze. No production code and no automated test should be written before the pseudo-code validation and persistence gates pass.

### 9. Define the test strategy

Invoke:

```text
@build-plan Create the COUNT_LINES test matrix, classify each block as unit or integration-testable, and define the RED-to-GREEN sequence with module validation criteria.
```

The result maps pseudo-code blocks to tests:

```text
input selection       -> unit tests
line counting         -> unit tests
error mapping         -> unit or integration tests
CLI argument/stdin seam -> composition test
browser UI             -> not applicable
```

The hidden gates are `risk-assessment` and `test-strategy`. TIED treats module validation as independent evidence, not as a single end-to-end test that happens to pass.

### 10. Run unit TDD and alignment

Invoke:

```text
@build-plan Implement the COUNT_LINES unit blocks using strict RED -> GREEN -> REFACTOR, then perform three-way alignment for every pseudo-code block.
```

For each unit block:

1. write a failing test first;
2. write the minimum production code to pass it;
3. refactor without changing behavior;
4. verify that pseudo-code, test comments, and production comments carry the same literal block lead and token set.

If the code reveals that the pseudo-code is wrong or incomplete, stop coding and use the **LEAP micro-cycle**: update IMPL first, then tests, then code. If scope changes, propagate it upward to ARCH and REQ.

The hidden gates are `unit-test-red`, `unit-test-green`, `unit-refactor`, and `three-way-alignment-unit`.

### 11. Test and implement composition

Invoke:

```text
@build-plan Add a failing composition test for CLI arguments and stdin reaching the COUNT_LINES module, then implement the thin entry point.
```

The composition test proves the binding:

```text
CLI trigger
  -> input resolver receives the right arguments
  -> counting module is called
  -> deterministic result or documented error is emitted
```

This does not need a browser or UI. A CLI seam can be invoked programmatically, so composition evidence is more direct than an E2E test. E2E is reserved for behavior that genuinely requires UI invocation and must include a platform-specific justification.

The hidden gate is `composition-integration`: failing binding test first, composition code second.

### 12. Verify, synchronize, and close out

Invoke:

```text
@build-plan Run the verification gate, synchronize TIED metadata with the final tests and code, and report any LEAP divergence.

@plan-close-out Prepare the TIED close-out, release-note changes if applicable, CITDP record, and proposed commit message without committing.
```

The final pass runs the project tests and language lint, validates changed YAML, audits tokens, checks three-way alignment, updates IMPL `code_locations` and `traceability.tests`, and runs:

```bash
"$CLIENT/.cursor/skills/tied-yaml/scripts/tied-cli.sh" \
  tied_validate_consistency '{}'
```

If the project uses verification-gated status, `tied_verify` derives status from passed tests. `plan-close-out` prepares the handoff; it does not silently stage, commit, amend, push, or access the clipboard.

## What TIED is doing in the background

The twelve prompts look like a conversation, but they are driving a larger system:

- **Vocabulary** — `RESOLVE`, `PRELOAD`, `RECORD`, and `VALIDATE` keep the feature's names consistent across the prompt, tokens, pseudo-code, tests, code, and user-facing text.
- **REQ** — freezes the observable behavior and acceptance criteria.
- **ARCH** — freezes the important boundaries and trade-offs.
- **IMPL** — turns the design into detailed, language-agnostic behavior and control flow.
- **Semantic tokens** — make `[REQ-COUNT_LINES]`, `[ARCH-COUNT_LINES]`, and `[IMPL-COUNT_LINES]` searchable links rather than decorative labels.
- **Pseudo-code validation** — catches missing contracts, undefined procedures, unhandled failure paths, and missing block token comments before implementation.
- **CITDP** — captures the change definition, impact map, risks, and test strategy so the reasoning survives the session.
- **Module validation** — requires isolated unit and contract evidence before modules are composed.
- **TDD** — makes tests conform to the IMPL before production code is written.
- **Composition evidence** — tests bindings between units without hiding wiring defects inside E2E.
- **LEAP** — propagates discovered changes in the safe direction: IMPL, then ARCH or REQ when scope changes, then tests and code.
- **YAML tooling and consistency checks** — keep indexes, detail files, token references, and traceability edges valid.
- **Close-out** — records evidence, synchronizes metadata, reconciles vocabulary, and leaves a proposed traceable commit.

The agent is not merely generating a file. It is moving a small unit of intent through a controlled pipeline:

```text
sponsor request
  -> vocabulary and change definition
  -> REQ / ARCH / IMPL
  -> pseudo-code gate
  -> RED tests
  -> GREEN code
  -> composition evidence
  -> verification
  -> synchronized durable record
```

## What exists after the walkthrough?

At the end, the project should contain the application code and tests plus a traceable TIED record:

```text
count-lines-project/
├── source/                         # the CLI and testable counting module
├── tests/                          # unit and composition evidence
├── .cursor/skills/                 # explicit TIED and Prompt Composer skills
└── tied/
    ├── requirements.yaml           # [REQ-COUNT_LINES]
    ├── architecture-decisions.yaml # [ARCH-COUNT_LINES]
    ├── implementation-decisions.yaml # [IMPL-COUNT_LINES]
    ├── semantic-tokens.yaml
    ├── requirements/REQ-COUNT_LINES.yaml
    ├── architecture-decisions/ARCH-COUNT_LINES.yaml
    ├── implementation-decisions/IMPL-COUNT_LINES.yaml
    ├── implementation-decisions/IMPL-COUNT_LINES-pseudocode.md
    ├── docs/
    └── vocab/
```

The exact source and test directories depend on the language and project conventions. TIED does not require a particular stack; it requires that the intent, boundaries, behavior, and evidence remain linked.

## A few troubleshooting rules

**The base path points at another repository.** Stop before any write. Set `TIED_BASE_PATH` to this client's absolute `tied/` directory, inspect `.cursor/mcp.json` if it already existed, and rerun `tied_config_get_base_path`.

**The MCP binary is missing.** Build it in the TIED repository with `npm install && npm run build` under `mcp-server`, or set `TIED_MCP_BIN` to an existing `dist/index.js`.

**A write targets `tied/methodology/`.** That is the inherited read-only tree. Put the application record in the project index and detail directories at the root of `tied/`.

**The consistency check fails.** Fix the reported index, detail, token, or pseudo-code issue through the TIED YAML tools, then rerun validation. Do not bypass the tool with a hand-edited YAML file.

**The request is ordinary local work, not a TIED change.** Use an explicitly named `@non-tied-plan` or `@non-tied-debug` skill. It may read TIED context but must not synchronize TIED records.

## The short version

1. Build the MCP server.
2. Run `copy_files.sh`.
3. Enable and confirm `tied-yaml`.
4. Start `@plan-new-feature`.
5. Let the twelve gates produce REQ, ARCH, IMPL, tests, code, composition evidence, and close-out.
6. Treat IMPL pseudo-code as the behavior source of truth.
7. Use LEAP whenever implementation evidence disagrees with the plan.
8. Finish with tests, token validation, vocabulary validation, and `tied_validate_consistency`.

That is the difference between asking an agent to “build a CLI” and giving it a methodology that can explain what it built, why it built it, and whether the implementation still matches the original intent.

Further reading: [`client-development-index.md`](../tied/docs/client-development-index.md) · [`agent-req-implementation-checklist.md`](../tied/docs/agent-req-implementation-checklist.md) · [`prompt-type-skills.md`](../tied/docs/prompt-type-skills.md) · [`adding-tied-mcp-and-invoking-passes.md`](../tied/docs/adding-tied-mcp-and-invoking-passes.md) · [`methodology-diagrams.md`](../tied/docs/methodology-diagrams.md) · [`Brownfield companion`](vocab-indices-and-tied-reddit-post.md)
