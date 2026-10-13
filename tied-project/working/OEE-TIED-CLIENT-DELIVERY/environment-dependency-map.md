# Environment dependency map — OEE-TIED-CLIENT-DELIVERY

**Baseline:** `b74d9548ffba11e44e081dbc055fe09824544497`

## Behavioral slices (BBCE — supplier view)

| Slice | Owning concern | Typical REQ clusters |
| --- | --- | --- |
| **Methodology corpus** | `tied-bundle/` refresh, vocab routing | Inherited REQ/ARCH/IMPL (read-only in client) |
| **Project YAML** | Client `tied-project/` tokens | Client-added `[REQ-*]` |
| **MCP tool surface** | Read/write/validate/gates | `REQ-TIED_SETUP`, gate enforcement, quality evidence |
| **Bootstrap / install** | Layout, skills, MCP merge | `REQ-TIED_LAYERED_CLIENT_INSTALL`, harness REQ |
| **Agent orchestration** | agentstream, prompt-type skills | `REQ-TIED_*` harness / agentstream |

## Public boundaries → consumers

| Boundary | Consumers (external to STDD repo) |
| --- | --- |
| MCP tool names + JSON schemas | Cursor, Claude Code, `tied-cli.sh`, CI scripts |
| `tied-install.sh` flags | Client repo operators, factory tests |
| Checklist slug names | Trackers, agentstream, gate validator |
| Skill command prefixes | Human sponsors invoking `/build-plan`, etc. |

## Binding inventory (high level)

| Trigger | Callee | Effect | Failure behavior |
| --- | --- | --- | --- |
| MCP `yaml_detail_update` | Files under `TIED_BASE_PATH` | Mutates project YAML | Invalid YAML / wrong path → silent wrong-repo risk (WF-001) |
| `tied gate check` | `tied_checklist_gate_validate` | Gate receipt | Exit 1 blocked; must not bypass with prose |
| `tied-install.sh` | Copy/sync `tied-bundle/` | Methodology refresh | Overwrites methodology only; preserves `.cursor/mcp.json` byte-for-byte when configured |

## Shared mechanisms (not feature decisions)

- YAML canonicalization (`lint_yaml`, `tied_yaml_format`)
- Token registry (`semantic-tokens.yaml`)
- Proof boundaries in quality assurance profiles

Feature-specific methodology rules stay in REQ/ARCH/IMPL — not in generic MCP helpers as hidden branches.

## Residuality hooks (optional)

| Stressor | Candidate residue if mishandled |
| --- | --- |
| Wrong `TIED_BASE_PATH` | Harmful residue: another repo’s YAML mutated |
| MCP absent, CLI fallback skipped | Harmful residue: hand-edited invalid YAML |
| Tracker dual-write | Harmful residue: gate pass without step evidence |

Consider `sub-residuality-analysis-pass` when enrolling a change that touches WF-001 + WF-003 together.
