# REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE — linked plan (refined)

**Status:** Plan-only (refine-plan pass); invoke `@build-plan` with this file as linked plan to implement.  
**Source:** Sponsor TODO 2026-11-01; prior Cursor plan `prompt_skill_execution_modes_feb6167d.plan.md`.  
**Tokens:** [REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE] (to mint at build) · extends [REQ-PROMPT_TYPE_GLOBAL_SKILLS] · [REQ-PROMPT_TYPE_SUBAGENT]

---

## 1. Problem statement

Leaf skills **`add-feature`** and **`refine-plan`** still route agents through **Implement** and shared **`tied-plan-citdp.md`** still tells Plan to **author RED tests**. That bypasses the sponsor’s explicit four-step sequences and breaks agents that lack Cursor IDE Plan mode: there is no skill-level contract that forbids product mutations during planning.

**Goal:** Make **skill execution mode** (`plan` | `agent`) normative in `prompt-shared` and leaf `SKILL.md` bodies so planning can complete with **`tied-project`** (or **`tied-project/non-tied-plans/`**) artifacts only, then hand off to execute leaves.

---

## 2. Sponsor sequences (normative)

| Lane | Ordered invocation | Skill execution mode |
|------|-------------------|----------------------|
| TIED-modifying | `add-feature` → `refine-plan` → `build-plan` → `close-out` | plan → plan → agent → agent |
| Non-TIED-modifying | `non-tied-plan` → `non-tied-refine` → `non-tied-build` → `non-tied-close` | plan → plan → agent → agent |

**Adjunct agent-mode helpers (unchanged, not new leaves):** `handoff`, `git-hygiene`, `clear-workspace` — document as optional after `close-out` / `non-tied-close`, not part of the four-step core.

**Unchanged monolithic leaves (explicit non-goals):** `debug`, `non-tied-debug`, `use-skill`, `question`, `other`, `citdp-record`, `citdp-promote`, LEAP/git leaves — no execution-mode split in this REQ unless a file touch is required for inventory counts only.

---

## 3. Terminology (disambiguation)

| Term | Meaning |
|------|---------|
| **skill execution mode** | Normative `plan` or `agent` declared in leaf skill body (see §4). Authoritative for allow/forbid mutations. |
| **Cursor IDE Plan mode** | Editor constraint when present; **additive** — never weakens skill execution mode forbids. |
| **harness profile** | Agentstream/Task tuning ([fresh-client-prompt-activation-map](../../tied-bundle/docs/fresh-client-prompt-activation-map.md)); **not** skill execution mode. |
| **prompt type** | Taxonomy branch (`add-feature`, …); avoid synonym **prompt mode**. |

Record in `tied-project/vocab/prompt-composer.md`: **skill execution mode**, **non-tied-plans root**, **plan-mode handoff**.

---

## 4. Shared contract: `prompt-execution-mode.md`

**Path:** `tools/bundled-prompt-type-skills/prompt-shared/prompt-execution-mode.md`

### 4.1 Plan mode

**Allowed**

- Read repo, TIED indexes, tests (read-only), MCP read/validate/analyze tools that do not mutate product code.
- **TIED lane:** Writes under `tied-project/working/{REQ-TOKEN}/` per [working-artifact-placement](../../tied-bundle/docs/working-artifact-placement.md): `PLAN.md`, `checklist-tracker.yaml`, draft `CITDP-*.yaml`, `test-strategy.md`, slug evidence markdown.
- **TIED lane:** Documentation-first **project** REQ/ARCH/IMPL **design** (indexes + detail + IMPL sidecar drafts) when scoped by the linked plan — still **no** `src/`, `tests/`, fixtures, or data mutations.
- **Non-TIED lane:** Writes under **`tied-project/non-tied-plans/{slug}/`** only (see §6).
- Optional advisory `tied_checklist_gate_validate` (`phase: pre_implementation`) with plan-only tracker; **gate blocking RED is expected success** for plan mode.

**Forbidden**

- Product code, tests, fixtures, data, regenerable audit snapshots (unless plan is explicitly docs-only about those paths and sponsor scoped zero product diff).
- `tied-implement.md` procedure; RED/TDD; composition/E2E; `tied_verify` with update.
- Claims of build complete, verification complete, or close-out complete.
- Running a **later** sequence step in the same invocation (no “mini build-plan” inside `add-feature`).

**Stop rule:** Emit **plan-mode handoff**: canonical paths, `request_token` or `{slug}`, next skill name (`@refine-plan`, `@build-plan`, …).

### 4.2 Agent mode

Execute leaves (`build-plan`, `close-out`, `non-tied-build`, `non-tied-close`) follow existing gate stacks; may mutate code/tests and run verification/close-out per their skills.

### 4.3 Leaf declaration (not YAML frontmatter)

E2E frontmatter contract allows only `name`, `description`, `disable-model-invocation`. Declare mode in skill body:

```markdown
## Execution mode

**skill execution mode:** plan
```

Static tests assert this section on the eight affected leaves (plan ×4, agent ×4 in §2).

---

## 5. TIED plan-mode shared splits

| New / updated shared file | Used by | Notes |
|---------------------------|---------|--------|
| `prompt-execution-mode.md` | All eight leaves + router | Single allow/forbid source |
| `tied-plan-prepare.md` | `add-feature`, `refine-plan` | Steps 1–4 + test-strategy **design** from `tied-plan-citdp.md`; **no** RED authoring |
| `tied-plan-citdp.md` | **Deprecate for plan leaves** — retain for `use-skill` until a follow-up | Or add banner: “Implement leaves only; plan leaves use tied-plan-prepare.md” |
| `tied-plan-citdp-build.md` | `build-plan` | Unchanged; RED stays here |

**Leaf procedure changes**

| Leaf | Procedure | Outputs |
|------|-----------|---------|
| `add-feature` | Refine → Plan (`tied-plan-prepare.md`); **remove Implement** | `working/{REQ}/PLAN.md`, tracker, draft CITDP, test-strategy |
| `refine-plan` | Same; **remove Implement**; require linked plan | Updated `PLAN.md` + tracker/CITDP |
| `build-plan` | Unchanged execute stack | agent mode section only |
| `close-out` | Unchanged | agent mode section only |

**`add-refine-build` orchestrator:** Document that children 1–2 are **plan mode** (no code); child 3 is agent mode; **`close-out` is a fourth sponsor invocation**, not part of the sequencer.

---

## 6. Non-TIED lane: `tied-project/non-tied-plans/`

**Sponsor decision (2026-11-03):** Durable non-TIED plans live under committed:

```text
tied-project/non-tied-plans/{slug}/
├── PLAN.md
├── CITDP-{slug}.yaml    # tied_tokens_new: [] always
├── test-strategy.md     # optional
└── evidence/            # optional handoff markdown
```

**Allowed (non-TIED plan/build track)**

- CITDP analysis records in this folder (or `citdp_record_write` targeting working copy — **not** promoting to full V+R+A+I).
- **RECORD** in `tied-project/vocab/` when non-tied plan skills introduce terms.

**Forbidden**

- `tied-project/requirements.yaml`, architecture/implementation indexes and details, IMPL pseudo-code sidecars.
- TIED checklist **Tracker** copies under `tied-project/working/{REQ}/` for non-tied sequence (use lightweight checklist notes in `non-tied-plans/{slug}/` if needed).
- `@citdp-promote` without explicit sponsor switch to TIED lane.

**Distinction from `@citdp-record`:** Standalone retrospective CITDP spike; non-tied **sequence** is the four-step plan/build/close path with artifacts under `non-tied-plans/`.

**New shared files:** `non-tied-plan-prepare.md`, `non-tied-build.md`, `non-tied-close.md` (split from `non-tied-plan.md`).

**New leaves:** `non-tied-refine`, `non-tied-build`, `non-tied-close` — mirror `refine-plan` / `build-plan` / lightweight close (scoped git commit; **no** unified TIED `close_out` gate stack).

Update **`non-tied-boundary.md`**: tier “non-tied plan track” vs legacy `non-tied-debug` boundary.

Update **`working-artifact-placement.md`**: committed tier row for `tied-project/non-tied-plans/`.

---

## 7. Router and inventory (15 → 18 leaves)

**New leaf IDs:** `non-tied-refine`, `non-tied-build`, `non-tied-close`.

**Must update in one change set (grep `15 leaf`, `LEAF_SKILLS`, `LEAF_PROMPT_TYPES`):**

| Location |
|----------|
| `mcp-server/src/e2e/prompt-type-skills.test.ts` |
| `mcp-server/src/e2e/prompt-type-subagent.test.ts` |
| `tools/bootstrap/manifest.json` `PROMPT_TYPE_SKILL_DIRS` |
| `tools/bundled-prompt-type-skills/prompt-type-router/SKILL.md` |
| `tied-project/vocab/prompt-composer.md` |
| `tied-bundle/docs/prompt-type-skills.md` |
| `tied-bundle/docs/fresh-client-prompt-activation-map.md` |
| `mcp-server/src/methodology-production-system-enrollment/constants.ts` `PROMPT_TYPE_LEAF_IDS` |
| `REQ/ARCH/IMPL` satisfaction criteria strings for GLOBAL_SKILLS + SUBAGENT + CITDP_RECORD_PROMOTE cross-refs |
| `.cursor/agents/` + three new agent md files |

**Router composition examples to add:**

- `add-feature`, `refine-plan`, `build-plan`, `close-out`
- `non-tied-plan`, `non-tied-refine`, `non-tied-build`, `non-tied-close`

**Merge gates:** Plan-mode leaves satisfy **Plan** gates only; Implement gates apply starting at `build-plan` / `non-tied-build`.

---

## 8. Depth, gates, methodology surface

This REQ changes **`prompt_type_workflow`** (new leaves + procedure). Per integrated activation §7, default **`depth_tier: integrated`** unless sponsor records **`integrated_waiver`** with owner, expiry, rationale in CITDP.

**Plan-mode pass (add-feature / refine-plan on this REQ):** Advisory pre_implementation gate; do not treat `allowed: false` for RED as refine failure.

**Build-mode pass:** Full pre_implementation before RED; verification + close_out per existing checklist.

**Surface enrollment:** At build, advisory [methodology-surface-enrollment-advisory.md](../../../tools/bundled-prompt-type-skills/prompt-shared/methodology-surface-enrollment-advisory.md) for `surface_ref` on new prompt types.

---

## 9. TIED stack (build-plan scope)

**Mint:** `REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE` with satisfaction criteria:

- Eight leaves declare skill execution mode in body; shared `prompt-execution-mode.md` installed.
- Plan mode forbids product mutations (e2e string contract).
- `tied-project/non-tied-plans/` documented in boundary + placement docs.
- 18 leaf inventory + `PROMPT_TYPE_LEAF_IDS` + bootstrap manifest aligned.
- Subagent tests: `add-feature` / `refine-plan` **Refine → Plan** only (no Implement section in agent body).

**Extend:** [REQ-PROMPT_TYPE_GLOBAL_SKILLS](../requirements/REQ-PROMPT_TYPE_GLOBAL_SKILLS.yaml), [REQ-PROMPT_TYPE_SUBAGENT](../requirements/REQ-PROMPT_TYPE_SUBAGENT.yaml) leaf counts.

**CITDP:** Draft at `tied-project/working/REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE/CITDP-REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE.yaml`; persist to `tied-project/citdp/` at close-out.

---

## 10. Test strategy (design only — no RED in this pass)

| Layer | Method |
|-------|--------|
| Static contract | Extend `prompt-type-skills.test.ts`: 18 leaves, new `SHARED_REFERENCES`, regex for `skill execution mode:` plan/agent on affected skills, forbid Implement link on plan leaves |
| Subagent contract | `prompt-type-subagent.test.ts`: replace add-feature Refine→Plan→Implement with Refine→Plan; plan-mode forbid phrases; three new agent files |
| Enrollment | Unit test: new leaf ids in `PROMPT_TYPE_LEAF_IDS` |
| Bootstrap | Full + linked install still parse frontmatter |
| Consistency | `tied_validate_consistency` after TIED writes |

**E2E product behavior:** Not required — documentation/skills-only change.

---

## 11. Implementation order (@build-plan)

1. REQ + ARCH + IMPL + semantic token + IMPL pseudo-code sidecar (token comments on blocks).
2. Shared markdown (`prompt-execution-mode.md`, splits, boundary/placement updates).
3. Leaf skills + router.
4. Vocab RECORD (`prompt-composer.md`).
5. Subagents.
6. Tests (RED first per PROC-TIED_DEV_CYCLE).
7. `tied_validate_consistency`, `lint_yaml`, activation map + `prompt-type-skills.md`.

---

## 12. Risks and costly choices

| Choice | Ladder | Notes |
|--------|--------|-------|
| 15 → 18 leaves | **Costly** | Single grep-driven sweep; no alias stubs |
| `non-tied-plans/` under `tied-project/` | **Reversible** | New folder; clients commit by default |
| Split `tied-plan-citdp.md` consumers | **Costly** | `use-skill` still references old file until follow-up |
| Optional sequencers `add-refine-build-close-out`, `non-tied-plan-refine-build-close` | **Reversible defer** | Document manual four-invocation sequence first |

---

## 13. Refine-plan handoff (this session)

- **Linked plan improved:** this file replaces the Cursor-only plan as the committed source of truth.
- **Next step:** `@build-plan` with linked plan `tied-project/working/REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE/PLAN.md`.
- **Not done:** Product code, tests, skill bundle edits (plan-mode self-dogfood).
