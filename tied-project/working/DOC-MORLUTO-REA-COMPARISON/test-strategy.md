# Test strategy — DOC-MORLUTO-REA-COMPARISON Wave 3

**Track:** doc-only harness compose · **no RED tests** · **no `tied_verify`**

| ID | Check | Method | Pass criterion |
| --- | --- | --- | --- |
| W3-LINK-01 | Comparison ↔ working plan | Manual / `rg` | Wave 1 ↔ Wave 2 sibling links resolve |
| W3-LINK-02 | Bundle compose links | Manual | New client-development-index row links to Wave 2 analysis |
| W3-LINK-03 | HTOL compose | Manual | harness-trace-observation-loop cites morluto comparison; states TIED-write vs external-read boundary |
| W3-TOKEN-01 | No YAML mint from prose | `rg '\[REQ-' docs/comparisons/morluto-rea-*.md` | Only narrative references; no new enforced tokens in comparison bodies |
| W3-PHASE-01 | Phased table | Read Wave 2 § Phased recommendations | Phase 0–1 status matches disk after build |
| W3-GIT-01 | Allowlist | `git check-ignore -v docs/comparisons/morluto-rea-reverse-engineering.md` | Not ignored (allowlist active) |
| W3-HANDOFF-01 | Plan execution steps | Read `evidence/session-handoff.md` | Required slugs align with `PLAN.md` |

**Security / ops:** Document install-order warning (TIED vs REA MCP config merges) in bundle edits only — no credential or vendor setup in stdd CI.

**Proof boundary:** No REA MCP execution, no `tied_validate_consistency` unless project YAML is touched (forbidden in default scope).
