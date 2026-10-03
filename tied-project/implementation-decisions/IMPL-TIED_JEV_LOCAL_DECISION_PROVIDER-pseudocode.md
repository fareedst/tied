# [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] [ARCH-TIED_JEV_LOCAL_DECISION_PROVIDER] [REQ-TIED_JEV_LOCAL_DECISION_PROVIDER] — local decision provider.

Grammar-Version: v2

## Configuration

procedure RESOLVE_LOCAL_PROVIDER_CONFIG:
  # [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] [ARCH-TIED_JEV_LOCAL_DECISION_PROVIDER] [REQ-TIED_JEV_LOCAL_DECISION_PROVIDER] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: parse TIED_JEV_* env; default provider remote; absolute bridge only.
  Contract:
    INPUT: env map
    OUTPUT: LocalProviderConfig
    PRE: true
    POST: invalid provider → remote + diagnostic
    EFFECTS: pure
  PARSE provider, fallback, timeout caps, bridge path
  RETURN config

procedure ASSESS_DECISION_BACKEND_READINESS:
  # [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] [REQ-TIED_JEV_LOCAL_DECISION_PROVIDER] How: remote needs JEV_API_KEY; local needs absolute bridge + executable; auto accepts either.
  Contract:
    INPUT: env, optional JevClientConfig overrides
    OUTPUT: boolean ready
    PRE: true
    POST: local provider never implies remote key
    EFFECTS: pure
  EVALUATE per provider mode
  RETURN ready

procedure ROUTE_DECISION_PROVIDER:
  # [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: jevDecide entry selects local, remote, or auto with explicit fallback.
  Contract:
    INPUT: state, questions, JevClientConfig
    OUTPUT: JevDecideResult
    PRE: state size checked before backend invoke
    POST: local mode never calls HTTP; auto fallback observable in trace meta
    FAILURE_MODES: provider_misconfigured, local_timeout, decision_backend_unavailable
    EFFECTS: subprocess | Http | pure skip
  RESOLVE config
  BRANCH on provider
  RETURN normalized result

procedure INVOKE_REMOTE_DECIDE:
  # [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: extracted HTTP /v1/decide path from client.ts; unchanged response shape.
  Contract:
    INPUT: state, questions, config
    OUTPUT: JevDecideResult
    PRE: apiKey present for success path
    POST: bearer auth to vendor
    EFFECTS: Http
  CALL postDecide with redacted state

procedure INVOKE_LOCAL_DECISION_BRIDGE:
  # [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] How: spawn shell:false [executable, bridgePath]; stdin JSON request; bounded stdout.
  Contract:
    INPUT: LocalProviderConfig, state, questions, optional LocalProcessRunner
    OUTPUT: raw bridge stdout parsed
    PRE: absolute bridge path
    POST: timeout kills child
    FAILURE_MODES: local_timeout, local_bridge_failed
    EFFECTS: subprocess
  WRITE stdin jev-local-bridge-request.v1
  READ stdout cap
  RETURN process result

procedure NORMALIZE_LOCAL_RESPONSE:
  # [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] How: validate jev-local-bridge-response.v1 and probability bounds.
  Contract:
    INPUT: parsed bridge JSON
    OUTPUT: JevDecideResult
    PRE: schema field present
    POST: invalid probabilities → malformed_local_response skip
    EFFECTS: pure
  MAP ok response to JevDecideResponse

procedure HANDLE_LOCAL_FAILURE:
  # [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] How: auto applies TIED_JEV_LOCAL_FALLBACK skip|error|remote; local mode never remote.
  Contract:
    INPUT: local failure, fallback policy
    OUTPUT: JevDecideResult
    PRE: auto only for fallback remote egress
    POST: remote fallback logged in context_meta
    FAILURE_MODES: decision_backend_unavailable, provider_misconfigured
    EFFECTS: optional Http when fallback remote

procedure EXTEND_HARNESS_BACKEND_SIGNAL:
  # [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: JevHarnessConfig.decisionBackendReady replaces hasApiKey-only gating for blocking tools.
  Contract:
    INPUT: env, manifest flag
    OUTPUT: JevHarnessConfig
    PRE: W5 harness enabled unchanged
    POST: local-only harness may block without JEV_API_KEY when bridge ready
    EFFECTS: pure

procedure EXTEND_DECIDE_TRACE_PROVIDER_META:
  # [IMPL-TIED_JEV_LOCAL_DECISION_PROVIDER] [REQ-TIED_JEV_DECISION_COPROCESSOR] How: additive context_meta decision_provider, fallback_applied, redacted bridge basename.
  Contract:
    INPUT: env, routing outcome
    OUTPUT: context_meta fields
    PRE: trace opt-in unchanged
    POST: no secrets in meta
    EFFECTS: pure
