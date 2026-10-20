# Working artifact placement

**Audience:** Sponsors, operators, and AI agents in TIED client projects (after `tied-install` linked/full install).

**Tokens:** [REQ-TIED_WORKING_ARTIFACT_PLACEMENT], [ARCH-TIED_WORKING_ARTIFACT_PLACEMENT], [REQ-TIED_TWO_FOLDER_LAYOUT], [ARCH-TIED_TWO_FOLDER_LAYOUT], [IMPL-TIED_TWO_FOLDER_LAYOUT]

**Purpose:** One policy for **where to put** artifacts during a REQ: ephemeral (discard), **local working evidence** (regenerate), **committed process evidence** (preserve rationale in git), and **canonical traceability** (REQ/ARCH/IMPL + CITDP).

**Normative behavior:** Path resolution and automatic routing use `classifyWorkingRelativePath` and `resolveWorkingPath` in the MCP server (`mcp-server/src/working-root.ts`). This document must stay aligned with `LOCAL_WORKING_PREFIXES` in that file—do not maintain a competing table elsewhere.

---

## Retention tiers

| Tier | Intent | Typical location | Git (client) |
| --- | --- | --- | --- |
| **Canonical traceability** | Source of truth for obligations | `tied-project/requirements.yaml`, detail dirs, `tied-project/citdp/CITDP-*.yaml` after close-out | Always commit |
| **Committed process evidence** | Human-auditable rationale and close-out facets | `tied-project/working/{REQ-TOKEN}/` | Commit (`tied-project/` is never gitignored) |
| **Local working evidence** | Regenerable machine proof; high volume | `tied-bundle/working/{REQ-TOKEN}/`, globals under `tied-bundle/working/` | Ignored (whole `tied-bundle/` line) |
| **Ephemeral / disposable** | Throwaway runs | Tooling scratch (below); `*-CLIENT-*`; live `*-live.v1.json` | Never commit |

**Rule of thumb:** If a future reviewer must answer *why we accepted this gate, scope, or costly choice* without re-running tools, use **committed process evidence** or **`tied-project/citdp/`**.

---

## Two working roots

| Term | Path | Role |
| --- | --- | --- |
| **Committed working root** | `tied-project/working/` | PLAN, tracker, envelope, slug evidence markdown, handoffs, draft CITDP |
| **Local working root** | `tied-bundle/working/` | Gates, ledgers, adversarial-inquiry trees, adherence/JEV traces, pseudocode-analysis runs |

**Two-folder invariant:** [REQ-TIED_TWO_FOLDER_LAYOUT] — do not gitignore paths under `tied-project/`; do not commit client methodology under `tied-bundle/` ([PROC-TIED_METHODOLOGY_READONLY](processes.md)). On **clients**, `tied-install` writes only the `# BEGIN TIED INSTALL MANAGED` block (`tied-bundle/` covers all of `tied-bundle/working/**`); it does **not** append `# BEGIN TIED LOCAL WORKING` or undivided-store mirror blocks. On the **TIED store repository**, git tracks the **methodology corpus** under `tied-bundle/` except `# BEGIN TIED STORE LOCAL WORKING (managed)` (`tied-bundle/working/`, `tied-bundle/install.json`); runtime MCP writes still land under `tied-bundle/working/{REQ}/` but those paths stay out of the index ([REQ-TIED_STORE_BUNDLE_GIT_POLICY]).

---

## Per-REQ layout (committed)

Under `tied-project/working/{REQ-TOKEN}/`:

| Artifact | Notes |
| --- | --- |
| `PLAN.md` | Linked plan / refine output |
| `checklist-tracker.yaml` | Per-request checklist copy |
| `CITDP-*.yaml` | Draft until `persist-citdp-record` → `tied-project/citdp/` |
| `evidence/request-evidence-envelope.v1.json` | Machine index; paths relative to **repository project root** |
| `evidence/*-evidence.md` | Checklist slug summaries (workflow facets) |
| `handoffs/{phase}.yaml` | Additive handoff YAML; does not replace envelope |
| `evidence/verification-evidence-manifest.v1.json` | When close-out proof requires it |
| Curated quality-manifest JSON | When envelope/CITDP references them as blocking proof |

Prefer summary markdown + manifest JSON over raw `*.stdout.txt` unless the envelope lists stdout as blocking proof.

---

## Per-REQ layout (local)

Under `tied-bundle/working/{REQ-TOKEN}/`, relative paths are classified **local** when they match:

| Rule | Patterns |
| --- | --- |
| Prefixes | `gates/`, `gate-`, `adversarial-inquiry/`, `adherence/`, `jev/`, `pseudocode-analysis/` |
| Ledgers | `*-ledger.jsonl`, paths containing `/ledger.jsonl` |
| Disposable clients | `*-CLIENT-*` anywhere in the relative path |

Team extensions: optional `working.local_patterns` in `tied-project/config.yaml` (defaults remain in code).

Tools and MCP writers should use layout helpers so artifacts land here automatically.

---

## Gray zones

| Situation | Default |
| --- | --- |
| Large JSON under `tied-project/working/` (qualification, claims-review) | **Commit** when an agreed regression fixture or pilot artifact referenced by envelope/CITDP; **local** when one-off reproducible tool output |
| `tied-project/working/evaluation/` cross-REQ corpora | **Commit** when defining reusable evaluation policy; not a substitute for per-REQ envelope |
| Store repo git-tracked pins under `tied-bundle/working/` | **Migrated** — fixture corpus under `mcp-server/test/fixtures/store-local-working/`; runtime local root unchanged ([REQ-TIED_STORE_BUNDLE_GIT_POLICY]) |
| Undivided repo-root `working/` | Non-standard — use `tied-project/working/`; re-run `tied-install` if layout is wrong |

---

## TIED-adjacent tooling scratch

These paths are **not** per-REQ committed working; treat as ephemeral unless explicitly promoted into `tied-project/working/`:

| Path / convention | Role |
| --- | --- |
| `mcp-server/working/` | MCP server CWD gate scratch |
| `TIED_TEST_ROOT/<unix-seconds>/` | Disposable TIED client (factory smoke) |
| `tied-bundle/working/*-CLIENT-*/` | Cohort / mini-project trees |
| `tied-bundle/working/features/` | FEAT dev scratch (TIED source store) |
| `tied-bundle/working/**/context-pruning-benchmark-live.v1.json` | Live benchmark output |

**Close-out strays:** [PROC-GITIGNORE_CLOSE_OUT](processes.md) — classify ignore / track / delete; not a placement policy.

---

## TIED source repository exception

- **`tied-bundle/`** is the committed methodology corpus in the store; only **`tied-bundle/working/`** and **`tied-bundle/install.json`** stay ignored.
- Committed process evidence uses the same rules: **`tied-project/working/`**.

---

## What not to do

- Commit client **`tied-bundle/`** methodology copies.
- Park high-volume gate JSON under **`tied-project/working/`** to satisfy CI.
- Copy another REQ’s checklist **execution_evidence** as proof.
- Invent a second local-path table that diverges from `working-root.ts`.

---

## Related docs

- [request-evidence-envelope.md](request-evidence-envelope.md) — envelope build/validate (layout-aware paths)
- [agent-req-implementation-checklist.md](agent-req-implementation-checklist.md) — executable procedure
- [client-development-index.md](client-development-index.md) — session bootstrap
- [processes.md](processes.md) — `[PROC-WORKING_ARTIFACT_PLACEMENT]`, `[PROC-GITIGNORE_CLOSE_OUT]`
