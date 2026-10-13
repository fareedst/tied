# External workflow register — TIED client delivery

**OEE id:** OEE-TIED-CLIENT-DELIVERY  
**Baseline revision:** `b74d9548ffba11e44e081dbc055fe09824544497`  
**Last updated:** 2026-10-12

| wf_id | Actor | Trigger | Public boundary | Summary steps | Observable effects | Evidence refs | Disposition | Compatibility | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WF-001 | Client developer / agent | New session or YAML edit | MCP **`tied-yaml`** stdio + **`tied_config_get_base_path`** | Open IDE → confirm MCP → call read/write tools → `tied_validate_consistency` | Project YAML under intended `tied-project/` updated; consistency ok | `AGENTS.md` §2; `.cursor/skills/tied-yaml/SKILL.md` | observed | preserve | methodology maintainers |
| WF-002 | Client operator | Clone or refresh client | **`tied-install.sh`** CLI | Run install (linked/full) → verify `tied-bundle/` stub or materialized → optional hooks | Skills/docs/MCP defaults present; methodology read-only | `tools/bootstrap/README.md`; `REQ-TIED_LAYERED_CLIENT_INSTALL` working plans | observed | preserve | methodology maintainers |
| WF-003 | Agent on enrolled REQ | Checklist phase gate | **`tied gate check`** / **`tied_checklist_gate_validate`** | Tracker + CITDP paths → gate phase → receipt under `working/{REQ}/gates/` | `allowed: true/false`; blocked progression when false | `client-development-index.md` adherence section; gate tests | observed | preserve | gate enforcement owners |
| WF-004 | Sponsor / agent | Feature or change request | **Prompt Composer** skills (`/plan-new-feature`, `/build-plan`, …) | Skill → Refine/Plan/Implement → Tracker updates → optional MCP writes | Linked plan + evidence paths; no substitute for gates | `tied-bundle/docs/prompt-composer.md`; bundled skills README | observed | migrate | prompt-type maintainers |
| WF-005 | CI / operator | Verification close-out | **`tied agentstream`** (optional) | Non-interactive checklist driver → harness receipts | Tracker receipts; not interchangeable with interactive MCP writes | `tied-project/vocab/agentstream.md` | unresolved | unknown | agentstream owners |

## Notes

- **WF-001:** Wrong `TIED_BASE_PATH` is a fleet **environmental stress**; evidence is procedural docs + RISK-010, not a single test in client repos.
- **WF-004:** Skill display names may differ by harness (Cursor vs Claude); compatibility stance `migrate` allows documentation bridges without freezing marketing labels.
- **WF-005:** Disposition `unresolved` until pilot records explicit non-implication rules vs WF-003 in operator runbooks.
