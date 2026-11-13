# LEAP proposal — registry → replay manifest generator

**Status:** pending  
**Context:** M4 refine locks manual mapping from [traditional-workflow-trial-runs-registry.md](../../../docs/demos/traditional-workflow-trial-runs-registry.md) **Client ID** to `client_root` in replay YAML.

## Proposal

Optional `harness-eval replay manifest-from-registry` subcommand or maintainer script in a follow-on REQ after M4 operator validation of batch replay.

## Rationale

Markdown table parsing is fragile; M4 ships schema + batch import only.
