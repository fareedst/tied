# Using REA with TIED — operator guide

| Field | Value |
| --- | --- |
| **Initiative** | `DOC-MORLUTO-REA-COMPARISON` |
| **Audience** | Sponsors and operators in a **TIED client** that also enabled **REA** (morluto/rea) |
| **Status** | Tracked operator guide (2026-11-08) — **does not mint** REQ/ARCH/IMPL |
| **Skim checklist** | [dual-mcp-operator-checklist.md](./dual-mcp-operator-checklist.md) (~2 min before dual-MCP sessions) |
| **Analysis** | [morluto-rea-reverse-engineering-vs-tied-agent-management.md](../../../docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md) |
| **Vocabulary** | [external-investigation-mcp.md](../../vocab/external-investigation-mcp.md) |

**Compose-don't-replace:** REA investigates **external or shipped** targets and returns **Evidence** with limitations. TIED owns **R+A+I**, tests, gates, and **`tied-project/`** writes. Re-implementation always flows through TIED after investigation.

---

## Authority (dual MCP)

| Surface | May mutate `tied-project/`? | Role |
| --- | --- | --- |
| **TIED YAML MCP** / **`tied-cli.sh`** (confirmed **`tied_config_get_base_path`**) | **Yes** | REQ, ARCH, IMPL, CITDP, validation |
| **REA MCP** (`io.github.morluto/rea`) | **No** | Read / investigate targets; **REA Evidence** |
| **Harness observations** (`tied_feedback_capture_observation`) | N/A | Qualitative notes only — **not** gate receipts |

**Install order:** `tied-install.sh` and `rea setup` both touch client MCP config. Review backups; merges are **not** assumed commutative. Re-run **`tied_config_get_base_path`** after vendor setup.

**Out of scope for TIED methodology:** bundling REA in stdd CI, mandatory `rea-agents` dependency, Ghidra/IDA as TIED prerequisites ([PLAN.md](./PLAN.md)).

---

## Minimum steps: client + simple target + TIED handoff

### 1 — TIED client

From the **TIED store** (after `./build-workspace.sh`):

```bash
source scripts/build-commands.sh
CLIENT=$(test-new-tied-client --out-path --tag rea-smoke)
```

Or install an existing repo: `./tied-install.sh /path/to/client`.

Then:

1. Open the client in **Cursor**.
2. Enable **`tied-yaml`** (and opt-in MCP if used) in **Settings → MCP**.
3. Call **`tied_config_get_base_path`** — must resolve to this client’s **`tied-project/`**.
4. Skim [dual-mcp-operator-checklist.md](./dual-mcp-operator-checklist.md).

Factory bootstrap does **not** install REA ([tools/bootstrap/README.md](../../../tools/bootstrap/README.md)).

### 2 — REA (operator-owned)

```bash
npx rea-agents setup
```

Select **Cursor**, approve staged writes, restart the agent. Optional: REA workflow skill **`reverse-engineer-anything`** ([Wave 1 capture](../../../docs/comparisons/morluto-rea-reverse-engineering.md)).

### 3 — Investigate a simple target

Prefer a low-friction target first (no native engine required):

```bash
npx -y rea-agents@latest analyze-javascript-application /absolute/path/to/small-app --json
```

Or agent + REA MCP with a **scoped** prompt (third-party / shipped artifact — not “we already have full source in git”).

Keep **unknowns** and **limitations** in the thread. Do **not** paste Evidence ids into `requirements.yaml`.

### 4 — Hand off to TIED (mandatory for shipped work)

Present findings as **`@add-feature` to the TIED system** — not ad-hoc YAML from investigation prose.

**Sponsor picks one goal:**

| Goal | Use when |
| --- | --- |
| **Existing implementation (R + A + I)** | REA informs **brownfield** alignment in **this** repo (gap-fill, tests/docs vs observed behavior). |
| **Transform for another platform (R + A + I)** | Extract **features** from the target; build **transform** REQ/ARCH/IMPL for a **port, re-platform, or parallel client**. |

Then: **`refine-plan` → `build-plan`** (CITDP when promoted) → TDD → gates → **`tied_validate_consistency`** / **`tied_verify`** as applicable → **`close-out`**.

Detail: [dual-mcp-operator-checklist § REA → TIED add-feature](./dual-mcp-operator-checklist.md#rea--tied-add-feature-required-handoff).

### Example add-feature remainder (transform)

```text
@add-feature

Working token: REQ-<NAME>
Goal: transform R+A+I — re-implement <features> from REA investigation of <target>
REA context: Evidence summary attached for humans only; not acceptance criteria
Platform: <this client or other repo path>
Non-goals: no Evidence-as-gates; no YAML writes via REA MCP
```

---

## Instructions and tools map

### Read first

| Doc | Purpose |
| --- | --- |
| This guide | End-to-end REA × TIED |
| [dual-mcp-operator-checklist.md](./dual-mcp-operator-checklist.md) | Session skim table |
| [external-investigation-mcp.md](../../vocab/external-investigation-mcp.md) | Canonical terms |
| [client-development-index.md](../../../tied-bundle/docs/client-development-index.md) | Quick read row + scenario routing |
| [agent-req-implementation-checklist.md](../../../tied-bundle/docs/agent-req-implementation-checklist.md) | Full implement cycle |
| [authority-boundary-operator-checklist.md](../REQ-TIED_HARNESS_PLATFORM_SEAM/authority-boundary-operator-checklist.md) | Harness vs TIED gates (distinct seam) |

### IDE tools

| Tool | Layer |
| --- | --- |
| REA MCP + vendor skills | Investigation |
| TIED YAML MCP / `tied-cli.sh` | Project YAML |
| `/add-feature`, `/refine-plan`, `/build-plan`, `/close-out` | Prompt-type skills (`tied-install.sh`) |
| `tied_checklist_gate_validate`, `tied_validate_consistency`, `tied_verify` | Proof (when in scope) |

---

## Bounded recommendations (status)

| # | Recommendation | Status in stdd |
| --- | --- | --- |
| 1 | Dual MCP checklist (TIED write vs REA read) | **Done** — [dual-mcp-operator-checklist.md](./dual-mcp-operator-checklist.md) |
| 2 | Install order discipline | **Documented** — checklist **Before session** + vocab |
| 3 | REA → TIED `@add-feature` handoff | **Documented** — checklist + this guide |
| 4 | Schema profiles (compact/full pattern) | **Operator pattern only** — checklist **Before turn**; no TIED product change |
| 5 | Source-available vs shipped target boundary | **Documented** — checklist **Before session** |
| 6 | RE session observations → feedback MCP | **TIED-existing** — checklist **During investigation** |
| 7 | Open Ontologies cross-read (RE vs RDF) | **Comparison prose only** — separate large-MCP training if both enabled |

Source list: [comparison § Bounded operator recommendations](../../../docs/comparisons/morluto-rea-reverse-engineering-vs-tied-agent-management.md#bounded-operator-recommendations-recommendation-only).

---

## Automation: what exists today

| Mechanism | Automates | Does **not** include REA |
| --- | --- | --- |
| **`test-new-tied-client`** | Disposable TIED client, lint, G4 audit, TIED MCP stubs, git init | **Yes** — no `rea setup` |
| **`workflow-trial-agentstream wf-NN`** | Bootstrap + four-phase **PROMPT-WF** agentstream (add-feature → close-out) | **Yes** — TIED trial catalog only |
| **`tied agentstream`** | Batch / checklist-driven turns | **Yes** — unless operator adds REA MCP manually |

There is **no** `workflow_trial_range` or **touchless REA→re-implement** orchestrator in this repository. Unattended paths prove **TIED workflow trials**, not reverse-engineering plus transform R+A+I.

**Scriptable client path only:**

```bash
source scripts/build-commands.sh
WORKSPACE=$(test-new-tied-client --out-path --tag my-rea-client)
# Then: human or custom automation for npx rea-agents setup + IDE session
```

Future dual-MCP factory or CI would be a **separate scoped `@add-feature`** — not part of `DOC-MORLUTO-REA-COMPARISON` compose.

---

## Anti-patterns

- REA **Evidence** as gate receipts or **`tied_validate_consistency`** substitute
- Investigation conclusions as automatic **LEAP** without CITDP / tests
- REA MCP (or any external investigation MCP) **writing** `tied-project/` YAML
- Expecting **`workflow-trial-agentstream`** to reverse-engineer a target

---

## Related paths

| Artifact | Path |
| --- | --- |
| Session handoff | [evidence/session-handoff.md](./evidence/session-handoff.md) |
| Plan | [PLAN.md](./PLAN.md) |
| Matrix §2 row 19 | [methodology-composition-matrix.md](../../../docs/comparisons/methodology-composition-matrix.md#section-2-layer-c-adjacent-frameworks) |
| New client runbook | [pseudocode-new-client-tied-adherence-runbook.md](../../../docs/pseudocode-new-client-tied-adherence-runbook.md) |
| WF trial catalog | [catalog-traditional-workflow-trial-prompts.md](../../../docs/demos/catalog-traditional-workflow-trial-prompts.md) |
