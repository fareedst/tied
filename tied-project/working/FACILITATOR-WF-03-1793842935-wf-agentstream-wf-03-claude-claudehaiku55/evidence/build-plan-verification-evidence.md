# Facilitator verification evidence

## HEAD
5421367314b2c8915a483ef1476098275e31efb3

## npm test

> producer-consumer-wiring@0.1.0 test
> node --test test/wiring.test.js

✔ N emitted values arrive at the consumer in order through the wiring (0.936625ms)
✔ an unconnected consumer receives nothing (0.047542ms)
✔ after disconnect no further values reach the consumer (0.05825ms)
✔ received() returns a copy that callers cannot use to mutate consumer state (0.044708ms)
✔ library modules do not import each other or the wiring module (2.373042ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 62.969375

## tied_validate_consistency

Full JSON: [tied_validate_consistency.json](./tied_validate_consistency.json) (`"ok": true`).

Truncated stdout capture below:

## tied_validate_consistency (truncated stdout)
DIAGNOSTIC: TIED_RUNTIME_IGNORED_SHELL_ENV: global path env ignored; use .cursor/mcp.json and ./tied-install.sh --refresh
{
  "detail_files": {
    "ARCH-BBCE_SLICE_OWNERSHIP_SNIPPET": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-BBCE_SLICE_OWNERSHIP_SNIPPET",
      "top_level_key_ok": true
    },
    "ARCH-EVIDENCE_CHAIN_PROFILE": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-EVIDENCE_CHAIN_PROFILE",
      "top_level_key_ok": true
    },
    "ARCH-EVIDENCE_CHAIN_REPORT": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-EVIDENCE_CHAIN_REPORT",
      "top_level_key_ok": true
    },
    "ARCH-FEEDBACK_STORAGE": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-FEEDBACK_STORAGE",
      "top_level_key_ok": true
    },
    "ARCH-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING",
      "top_level_key_ok": true
    },
    "ARCH-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE",
      "top_level_key_ok": true
    },
    "ARCH-METHODOLOGY-LEARNING-COHORT-EXPORT": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-METHODOLOGY-LEARNING-COHORT-EXPORT",
      "top_level_key_ok": true
    },
    "ARCH-METHODOLOGY-LEARNING-EXPERIMENT": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-METHODOLOGY-LEARNING-EXPERIMENT",
      "top_level_key_ok": true
    },
    "ARCH-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT",
      "top_level_key_ok": true
    },
    "ARCH-METHODOLOGY-SURFACE-EXPERIMENT-GATE": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-METHODOLOGY-SURFACE-EXPERIMENT-GATE",
      "top_level_key_ok": true
    },
    "ARCH-MODULE_VALIDATION": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-MODULE_VALIDATION",
      "top_level_key_ok": true
    },
    "ARCH-PRODUCER_CONSUMER_WIRING": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-PRODUCER_CONSUMER_WIRING",
      "top_level_key_ok": true
    },
    "ARCH-PROMPT_TYPE_GLOBAL_SKILLS": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-PROMPT_TYPE_GLOBAL_SKILLS",
      "top_level_key_ok": true
    },
    "ARCH-PROMPT_TYPE_SUBAGENT": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-PROMPT_TYPE_SUBAGENT",
      "top_level_key_ok": true
    },
    "ARCH-QUALITY_ASSURANCE_PROFILES": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-QUALITY_ASSURANCE_PROFILES",
      "top_level_key_ok": true
    },
    "ARCH-TIED_ADVERSARIAL_INQUIRY": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-TIED_ADVERSARIAL_INQUIRY",
      "top_level_key_ok": true
    },
    "ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM",
      "top_level_key_ok": true
    },
    "ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT",
      "top_level_key_ok": true
    },
    "ARCH-TIED_CLIENT_METHODOLOGY_RESOURCE_MANIFEST": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-TIED_CLIENT_METHODOLOGY_RESOURCE_MANIFEST",
      "top_level_key_ok": true
    },
    "ARCH-TIED_FIDELITY_RESEARCH": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-TIED_FIDELITY_RESEARCH",
      "top_level_key_ok": true
    },
    "ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-TIED_SPONSOR_AGENT_RELATIONSHIP",
      "top_level_key_ok": true
    },
    "ARCH-TIED_STRUCTURE": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-TIED_STRUCTURE",
      "top_level_key_ok": true
    },
    "ARCH-TIED_VOCABULARY_LAYERS": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "ARCH-TIED_VOCABULARY_LAYERS",
      "top_level_key_ok": true
    },
    "IMPL-CONSUMER_MODULE": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-CONSUMER_MODULE",
      "top_level_key_ok": true
    },
    "IMPL-EVIDENCE_CHAIN_PROFILE": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-EVIDENCE_CHAIN_PROFILE",
      "top_level_key_ok": true
    },
    "IMPL-EVIDENCE_CHAIN_REPORT": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-EVIDENCE_CHAIN_REPORT",
      "top_level_key_ok": true
    },
    "IMPL-MCP_FEEDBACK_TOOLS": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-MCP_FEEDBACK_TOOLS",
      "top_level_key_ok": true
    },
    "IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING",
      "top_level_key_ok": true
    },
    "IMPL-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-METHODOLOGY-KAIZEN-EXPERIMENT-BRIDGE",
      "top_level_key_ok": true
    },
    "IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT",
      "top_level_key_ok": true
    },
    "IMPL-METHODOLOGY-LEARNING-EXPERIMENT": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-METHODOLOGY-LEARNING-EXPERIMENT",
      "top_level_key_ok": true
    },
    "IMPL-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-METHODOLOGY-PRODUCTION-SYSTEM-ENROLLMENT",
      "top_level_key_ok": true
    },
    "IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-METHODOLOGY-SURFACE-EXPERIMENT-GATE",
      "top_level_key_ok": true
    },
    "IMPL-MODULE_VALIDATION": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-MODULE_VALIDATION",
      "top_level_key_ok": true
    },
    "IMPL-PRODUCER_MODULE": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-PRODUCER_MODULE",
      "top_level_key_ok": true
    },
    "IMPL-PROMPT_TYPE_GLOBAL_SKILLS": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-PROMPT_TYPE_GLOBAL_SKILLS",
      "top_level_key_ok": true
    },
    "IMPL-PROMPT_TYPE_SUBAGENT": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-PROMPT_TYPE_SUBAGENT",
      "top_level_key_ok": true
    },
    "IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
      "token": "IMPL-QUALITY_ASSURANCE_PILOT_WEBHOOK",
      "top_level_key_ok": true
    },
    "IMPL-QUALITY_BINDING_INVENTORY": {
      "format": "yaml",
      "has_file": true,
      "ref_issues": [],
    
... (truncated if long)
