# gate-pseudocode-validation — REQ-TIED_PROCESS_CERTIFICATION_READINESS

**Build-plan:** pre_implementation gate allowed with sidecar refs on [gate-tracker-pre-implementation.yaml](../gate-tracker-pre-implementation.yaml).

**Plan-close-out replay:** Layer B `validateEssencePseudocode` with `gate_mode: true`, `require_contracts: true` on all six `IMPL-TIED_PROCESS_CERTIFICATION_*` sidecars — machine JSON [pseudocode-validate-close-out.v1.json](./pseudocode-validate-close-out.v1.json).

**Note:** Close-out replay reports advisory diagnostics (`MISSING_BLOCK_TOKEN_LINK`, `HOST_SYNTAX_LEAK`) consistent with Grammar-Version v2 sidecars validated at build boundary; product tests 15/15 and verification gate passed before this wave.
