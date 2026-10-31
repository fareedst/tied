# tied-project corpus map — TIED store (stdd)

**Audience:** Sponsors and agents onboarding to **this** repository (methodology store + dogfood client).

**Baseline revision:** `cf321c96`

## Layers

| Layer | Path | Role |
| --- | --- | --- |
| **Indexes** | `tied-project/requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, `semantic-tokens.yaml` | Normative REQ→ARCH→IMPL registry (~3.8k–5k lines each index) |
| **Detail files** | `tied-project/requirements/`, `architecture-decisions/`, `implementation-decisions/` | Token bodies + IMPL pseudo-code sidecars |
| **Working (committed)** | `tied-project/working/{REQ-TOKEN}/` | PLAN, tracker, envelope, EDPC, handoffs — [working-artifact-placement.md](../../../tied-bundle/docs/working-artifact-placement.md) |
| **CITDP (canonical analysis)** | `tied-project/citdp/CITDP-*.yaml` | Persisted change analysis after close-out |
| **Vocab** | `tied-project/vocab/*.md` | PRELOAD routing — start at [routing.md](../../vocab/routing.md) |
| **Methodology (read-only here)** | `tied-bundle/` | Installed corpus; refresh via `tied-install.sh --refresh` |
| **Local machine evidence** | `tied-bundle/working/{REQ}/` | Gates, ledgers — gitignored on clients; store policy varies |
| **Evaluation** | `tied-project/working/evaluation/` | Cross-REQ envelope gap snapshots |

## Scale (2026-10-31 inventory)

- **247** working top-level folders · **213** persisted CITDP files · **25** vocab markdown files
- **185** REQ detail files · **180** ARCH · **215** IMPL detail files
- **646** MCP TypeScript sources under `mcp-server/src/`

## Agent entry points

1. [AGENTS.md](../../../AGENTS.md) — operating guide
2. [client-development-index.md](../../../tied-bundle/docs/client-development-index.md) — scenarios and MCP tools
3. [README.md](../../../README.md) § Brownfield comprehension — EDPC choreography
4. [edpc-comprehension.md](../../vocab/edpc-comprehension.md) — EDPC terms
5. [tied-yaml-mcp.md](../../vocab/tied-yaml-mcp.md) — `TIED_BASE_PATH`, identity marker, index write isolation

## Store vs client

| | **TIED store (this repo)** | **Typical client after install** |
| --- | --- | --- |
| Methodology | Committed under `tied-bundle/` | Gitignored stub or full copy |
| Project YAML | `tied-project/` committed | `tied-project/` committed |
| MCP | Built from `mcp-server/` | Same skill + `tied-cli` pattern |

## Authority rules (comprehension vs TIED)

- **Indexes + `tied_verify`** decide obligation status — EDPC SCM in `working/DOC-STDD-TIED-PROJECT-BROWNFIELD/` is investigative.
- **REQ/IMPL implementation status:** Values in `requirements.yaml` / `implementation-decisions.yaml` (for example **Planned**, **In Progress**, **Implemented**) are **not** sponsor sign-off from this comprehension pass. Treat obligation status as **Unknown** in EDPC claims unless a **`tied_verify`** receipt (or verification-gated index update) is attached. See [Verification gaps](../../../../../docs/stdd-workflows.md#verification-gaps) and `[PROC-TIED_VERIFICATION_GATED]`.
- **Claims ledger:** Use **Declared** / **Derived** / **Observed** for investigation findings; use **Unknown** for per-REQ implementation status unless verify evidence is cited. Never classify a claim as **Verified** “Implemented” from SCM or corpus maps alone.
- **CITDP:** Prefer `tied-project/citdp/` over duplicate drafts in `working/` (65 identical drafts removed 2026-10-31; see [citdp-dedupe-log.md](./citdp-dedupe-log.md)).
- **Do not commit** repo-root `project-identity.v1.yaml` (local Path 3 dogfood only).

## Related sponsor doc

- [docs/stdd-workflows.md](../../../../../docs/stdd-workflows.md) — workflow hub (Mermaid), when present
