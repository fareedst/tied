# tied-project corpus map — TIED store (generated)

**Audience:** Sponsors and agents onboarding to **this** repository.

**Source:** `REQ-TIED_META_HUB_REPRESENTATION` · **Baseline:** `HEAD` · **Hub:** `tied-project/`

## Layers

| Layer | Path | Role |
| --- | --- | --- |
| **Indexes** | `tied-project/requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, `semantic-tokens.yaml` | Normative REQ→ARCH→IMPL registry |
| **Detail files** | `tied-project/requirements/`, `architecture-decisions/`, `implementation-decisions/` | Token bodies + IMPL pseudo-code sidecars |
| **Working (committed)** | `tied-project/working/{REQ-TOKEN}/` | PLAN, tracker, envelope, EDPC, handoffs |
| **CITDP (canonical analysis)** | `tied-project/citdp/CITDP-*.yaml` | Persisted change analysis after close-out |
| **Vocab** | `tied-project/vocab/*.md` | PRELOAD routing — start at [routing.md](tied-project/vocab/routing.md) |
| **Methodology (read-only here)** | `tied-bundle/` | Installed corpus; refresh via `tied-install.sh --refresh` |

## Scale (inventory)

| Signal | Count |
| --- | --- |
| `working/` top-level folders | 257 |
| Persisted `citdp/` files | 223 |
| Vocab markdown files | 25 |
| REQ detail files | 189 |
| ARCH detail files | 184 |
| IMPL detail files | 223 |

## Agent entry points

1. [AGENTS.md](../../AGENTS.md) — operating guide
2. [client-development-index.md](../../tied-bundle/docs/client-development-index.md) — scenarios and MCP tools
3. [edpc-comprehension.md](tied-project/vocab/edpc-comprehension.md) — EDPC terms
4. [edpc-meta-hub-engagement.md](../../tied-bundle/docs/edpc-meta-hub-engagement.md) — meta-hub pattern

## Authority rules (comprehension vs TIED)

- **Indexes + `tied_verify`** decide obligation status — EDPC SCM is investigative.
- **REQ/IMPL implementation status:** Treat as **Unknown** in EDPC claims unless a `tied_verify` receipt is attached (`[PROC-TIED_VERIFICATION_GATED]`).
- **CITDP:** Prefer `tied-project/citdp/` over duplicate drafts in `working/`.
