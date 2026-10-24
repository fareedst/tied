{
  "schema_version": "layer-b-pseudocode-validator.v1",
  "ok": true,
  "proof_boundary": "Structural pseudo-code shape, token linkage, and dependency diagnostics only; behavioral test coverage remains separate.",
  "blocks": [
    {
      "name": "RESOLVE_OPERATING_MODE",
      "line": 13,
      "token_refs": [
        "ARCH-TIED_CLAUDE_HARNESS",
        "IMPL-TIED_CLAUDE_HARNESS",
        "REQ-TIED_CLAUDE_HARNESS"
      ],
      "contract_fields": [
        "EFFECTS",
        "INPUT",
        "OUTPUT",
        "POST",
        "PRE",
        "TERMINATION"
      ]
    },
    {
      "name": "PHASE_0_PILOT_ACCEPTANCE",
      "line": 35,
      "token_refs": [
        "ARCH-TIED_CLAUDE_HARNESS",
        "IMPL-TIED_CLAUDE_HARNESS",
        "REQ-PROMPT_TYPE_GLOBAL_SKILLS",
        "REQ-TIED_CLAUDE_HARNESS",
        "REQ-TIED_SETUP"
      ],
      "contract_fields": [
        "DATA",
        "DATA_TRANSITION",
        "EFFECTS",
        "INPUT",
        "OUTPUT",
        "POST",
        "PRE",
        "TERMINATION"
      ]
    },
    {
      "name": "INSTALL_CLAUDE_SKILLS",
      "line": 59,
      "token_refs": [
        "ARCH-TIED_CLAUDE_HARNESS",
        "IMPL-TIED_CLAUDE_HARNESS",
        "REQ-PROMPT_TYPE_GLOBAL_SKILLS",
        "REQ-TIED_CLAUDE_HARNESS"
      ],
      "contract_fields": [
        "EFFECTS",
        "FAILURE_MODES",
        "INPUT",
        "OUTPUT",
        "POST",
        "PRE",
        "TERMINATION"
      ]
    },
    {
      "name": "INITIALIZE_CLAUDE_MCP_CONFIG",
      "line": 74,
      "token_refs": [
        "ARCH-TIED_CLAUDE_HARNESS",
        "IMPL-TIED_CLAUDE_HARNESS",
        "REQ-MCP_USAGE_METRICS",
        "REQ-TIED_CLAUDE_HARNESS"
      ],
      "contract_fields": [
        "EFFECTS",
        "FAILURE_MODES",
        "INPUT",
        "OUTPUT",
        "POST",
        "PRE",
        "TERMINATION"
      ]
    },
    {
      "name": "PRESERVE_CURSOR_MCP_INIT",
      "line": 93,
      "token_refs": [
        "ARCH-TIED_CLAUDE_HARNESS",
        "IMPL-TIED_CLAUDE_HARNESS",
        "REQ-GOAGENT-AGENT-EXECUTOR",
        "REQ-TIED_CLAUDE_HARNESS"
      ],
      "contract_fields": [
        "EFFECTS",
        "INPUT",
        "OUTPUT",
        "POST",
        "PRE",
        "TERMINATION"
      ]
    },
    {
      "name": "SELECT_AGENT_HARNESS",
      "line": 111,
      "token_refs": [
        "ARCH-TIED_CLAUDE_HARNESS",
        "IMPL-TIED_CLAUDE_HARNESS",
        "REQ-GOAGENT-AGENT-EXECUTOR",
        "REQ-TIED_CLAUDE_HARNESS"
      ],
      "contract_fields": [
        "EFFECTS",
        "INPUT",
        "OUTPUT",
        "POST",
        "PRE",
        "TERMINATION"
      ]
    },
    {
      "name": "RUN_AGENTSTREAM_TURN",
      "line": 126,
      "token_refs": [
        "ARCH-TIED_CLAUDE_HARNESS",
        "IMPL-TIED_CLAUDE_HARNESS",
        "REQ-TIED_CLAUDE_HARNESS"
      ],
      "contract_fields": [
        "EFFECTS",
        "FAILURE_MODES",
        "INPUT",
        "OUTPUT",
        "POST",
        "PRE",
        "TERMINATION"
      ]
    },
    {
      "name": "PUBLISH_REQ_FEAT_MATRIX",
      "line": 145,
      "token_refs": [
        "ARCH-TIED_CLAUDE_HARNESS",
        "IMPL-TIED_CLAUDE_HARNESS",
        "REQ-TIED_CLAUDE_HARNESS"
      ],
      "contract_fields": [
        "EFFECTS",
        "INPUT",
        "OUTPUT",
        "POST",
        "PRE",
        "TERMINATION"
      ]
    },
    {
      "name": "INSTALL_CLAUDE_MD_TEMPLATE",
      "line": 163,
      "token_refs": [
        "ARCH-TIED_CLAUDE_HARNESS",
        "IMPL-TIED_CLAUDE_HARNESS",
        "REQ-TIED_CLAUDE_HARNESS"
      ],
      "contract_fields": [
        "EFFECTS",
        "INPUT",
        "OUTPUT",
        "POST",
        "PRE",
        "TERMINATION"
      ]
    }
  ],
  "dependencies": [],
  "coverage": [
    {
      "block": "RESOLVE_OPERATING_MODE",
      "branch_lines": [
        22,
        24,
        33
      ],
      "failure_modes": [],
      "references": []
    },
    {
      "block": "PHASE_0_PILOT_ACCEPTANCE",
      "branch_lines": [
        53
      ],
      "failure_modes": [],
      "references": []
    },
    {
      "block": "INSTALL_CLAUDE_SKILLS",
      "branch_lines": [
        69
      ],
      "failure_modes": [
        "OUTPUT: installed_paths[] | error",
        "RETURN { error: SYMLINK_WITHOUT_CI_WINDOWS_PROOF }"
      ],
      "references": []
    },
    {
      "block": "INITIALIZE_CLAUDE_MCP_CONFIG",
      "branch_lines": [
        85,
        88
      ],
      "failure_modes": [],
      "references": []
    },
    {
      "block": "PRESERVE_CURSOR_MCP_INIT",
      "branch_lines": [
        97
      ],
      "failure_modes": [],
      "references": []
    },
    {
      "block": "SELECT_AGENT_HARNESS",
      "branch_lines": [
        120,
        122
      ],
      "failure_modes": [],
      "references": []
    },
    {
      "block": "RUN_AGENTSTREAM_TURN",
      "branch_lines": [],
      "failure_modes": [],
      "references": []
    },
    {
      "block": "PUBLISH_REQ_FEAT_MATRIX",
      "branch_lines": [],
      "failure_modes": [],
      "references": []
    },
    {
      "block": "INSTALL_CLAUDE_MD_TEMPLATE",
      "branch_lines": [
        164,
        172,
        173
      ],
      "failure_modes": [],
      "references": []
    }
  ],
  "diagnostics": []
}
