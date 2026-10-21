---
name: Pseudocode validate path input
overview: "Layer B `pseudocode_validate` accepts sidecar paths (alias `pseudocode_path`), shared TIED_BASE_PATH sandbox, and token-only default sidecar—inline semantics unchanged."
linked_cursor_plan: /Users/fareed/.cursor/plans/validate_path_input_3fea2021.plan.md
source_plan_id: validate_path_input_3fea2021
request_token: REQ-PSEUDOCODE_VALIDATE_PATH_INPUT
working_slug: REQ-PSEUDOCODE_VALIDATE_PATH_INPUT
refine: "refine-plan pass 1"
---

# PLAN — `pseudocode_validate` sidecar path input

**Primary REQ:** `[REQ-PSEUDOCODE_VALIDATE_PATH_INPUT]` · **Related:** `[REQ-PSEUDOCODE_STATIC_ANALYSIS]`, `[REQ-QUALITY_ASSURANCE_EVIDENCE]`, `[REQ-TIED_TOOL_INPUT_COMPATIBILITY]` (recovery-hint follow-up only)

**Depth:** `integrated` · **gate_policy:** `advisory` · **Implement:** deferred to `@build-plan`

Canonical Cursor plan with todos: [validate_path_input_3fea2021.plan.md](/Users/fareed/.cursor/plans/validate_path_input_3fea2021.plan.md)

---

## Refine pass 1 (Touchpoint 1 — RESOLVE)

### Intent (one line)

Let agents and operators run **Layer B** `pseudocode_validate` with **token + sidecar path** (including the sponsor’s exact `pseudocode_path` JSON) or **token-only** default sidecar, without -32602 `Required at pseudocode`, while keeping inline `pseudocode` behavior identical.

### Canonical vocabulary

| Preferred term | Meaning |
| --- | --- |
| **essence pseudocode source resolution** | Read-only choice among inline text, explicit path under `TIED_BASE_PATH`, or computed default sidecar path |
| **default sidecar resolution** | Token-only input maps to `implementation-decisions/{TOKEN}-pseudocode.md` when token matches `IMPL-*` |
| **`pseudocode_path`** | Ergonomic MCP alias for **`essence_pseudocode_path`** on `pseudocode_validate` only |
| **ambiguous pseudocode input** | More than one source kind supplied (inline + path, or both path keys) → `AMBIGUOUS_INPUT` |

RECORD targets: [`tied-project/vocab/tied-yaml-mcp.md`](../../vocab/tied-yaml-mcp.md), [`tied-project/vocab/pseudocode-and-citdp.md`](../../vocab/pseudocode-and-citdp.md).

### Sponsor decisions (recorded)

| Decision | Choice | Ladder |
| --- | --- | --- |
| Path fields + alias | `essence_pseudocode_path` + `pseudocode_path` | Reversible |
| Token-only fallback | Default sidecar from token | Costly — naming must match convention |
| Analyze handler refactor | Same PR if small; not blocking MVP | Reversible |
| `recovery_hint` text for validate | Defer to optional follow-up | Reversible |
| `depth_tier` | **integrated** (filesystem read + agent CLI) | Costly — inquiry before RED |
| `gate_policy` | **advisory** | Reversible |

### Non-goals

- Changing rules inside `validateEssencePseudocode` (Layer B semantics)
- Loading paths outside `TIED_BASE_PATH`
- Merging `pseudocode_validate` and `pseudocode_analyze`
- Token-only resolve from IMPL detail YAML `essence_pseudocode_path` (sponsor chose default filename convention instead)

### Unchanged-behavior checklist

| Surface | Must stay |
| --- | --- |
| Inline `pseudocode` + same flags | Same validation report shape (`layer-b-pseudocode-validator.v1`) |
| `pseudocode_analyze` | Behavior unchanged (optional refactor to shared resolver only) |
| Layer B validator core | No edits to contract/shape logic in `pseudocode-validator.ts` unless bug found |

### Anti-examples

- Accepting `../` escape or absolute paths outside base
- Using free-form token strings to build arbitrary filesystem paths
- Returning a different report `schema_version` for path-sourced vs inline-sourced text
- Silently ignoring unknown keys at MCP layer (alias must be explicit in schema)

---

## CITDP summary

Full record: [CITDP-REQ-PSEUDOCODE_VALIDATE_PATH_INPUT.yaml](CITDP-REQ-PSEUDOCODE_VALIDATE_PATH_INPUT.yaml)

**Current behavior:** `pseudocode_validate` Zod schema requires `pseudocode: string`. Path-only JSON fails at MCP with -32602 before handler runs.

**Desired behavior:** Optional inline `pseudocode`; optional `essence_pseudocode_path` or alias `pseudocode_path`; token-only `IMPL-*` resolves default sidecar; shared sandbox with analyze; input-stage errors as JSON `{ ok: false, stage: "input", error }` like analyze.

**LEAP (methodology + project):**

- Update [REQ-PSEUDOCODE_STATIC_ANALYSIS](../../requirements/REQ-PSEUDOCODE_STATIC_ANALYSIS.yaml) criterion from “schema unchanged” to **additive-only**.
- Update [IMPL-QUALITY_PSEUDOCODE_VALIDATOR](../../../tied-bundle/implementation-decisions/IMPL-QUALITY_PSEUDOCODE_VALIDATOR.yaml) MCP input documentation + `code_locations`.

---

## Architecture (refined)

**Resolution order** in `resolveEssencePseudocodeSource(basePath, args)`:

1. **Inline** — non-empty trimmed `pseudocode` → use text.
2. **Explicit path** — exactly one of `essence_pseudocode_path` or `pseudocode_path` (non-empty). If **both keys present** → `AMBIGUOUS_INPUT` (even if values equal).
3. **Default sidecar** — else if `token` matches **`^IMPL-[A-Z0-9_-]+$`** → relative path `implementation-decisions/${token}-pseudocode.md` under base (supports hyphenated tokens such as `IMPL-ATDD-E2E-AGENT_STREAM`).
4. Else → `MISSING_INPUT`.

Path steps use existing [`resolvePseudocodePathUnderTiedBase`](../../../../mcp-server/src/impl-pseudocode-input.ts) + `readTextFromPseudocodePath`.

**Refine correction (pass 1):** Do **not** use `^IMPL-[A-Z0-9_]+$` — it rejects valid hyphenated IMPL tokens.

**MCP schema:** `pseudocode`, `essence_pseudocode_path`, `pseudocode_path` all optional in Zod; handler enforces exclusivity. Prevents -32602 for sponsor exact payload.

**Proof boundary:** Resolver + MCP wiring only; Layer B proof remains `validateEssencePseudocode`.

---

## Test strategy

See [test-strategy.md](test-strategy.md).

**Sponsor replay (acceptance):**

```bash
.cursor/skills/tied-yaml/scripts/tied-cli.sh pseudocode_validate \
  '{"token":"IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK","gate_mode":true,"pseudocode_path":"implementation-decisions/IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK-pseudocode.md"}'
```

---

## Implement order (@build-plan)

1. Mint `[REQ-PSEUDOCODE_VALIDATE_PATH_INPUT]`, `[ARCH-PSEUDOCODE_INPUT_RESOLUTION]`, `[IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT]` + semantic tokens; promote pseudocode from [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT-pseudocode.md](IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT-pseudocode.md).
2. RED — `resolve-essence-pseudocode-source.test.ts` + MCP test with sponsor JSON.
3. GREEN — resolver + `pseudocode_validate` handler/schema; optional analyze refactor.
4. LEAP — REQ-PSEUDOCODE_STATIC_ANALYSIS, IMPL-QUALITY_PSEUDOCODE_VALIDATOR.
5. Docs — `mcp-server/README.md`, `pseudocode-writing-and-validation.md`, `tools/bundled-tied-yaml-skill/SKILL.md`.
6. Gates — verification, `tied_validate_consistency`, persist `tied-project/citdp/CITDP-REQ-PSEUDOCODE_VALIDATE_PATH_INPUT.yaml`.

---

## Refine pass 1 outputs

| Artifact | Path |
| --- | --- |
| Tracker | [checklist-tracker-refine.yaml](checklist-tracker-refine.yaml) |
| CITDP | [CITDP-REQ-PSEUDOCODE_VALIDATE_PATH_INPUT.yaml](CITDP-REQ-PSEUDOCODE_VALIDATE_PATH_INPUT.yaml) |
| IMPL pseudo (draft) | [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT-pseudocode.md](IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT-pseudocode.md) |
| Provenance | [evidence/plan-refine-provenance.md](evidence/plan-refine-provenance.md) |

**Next:** `@build-plan` linked to this PLAN after `pre_implementation` gate allows.
