# Intent elevation matrix — DOC-STDD-TIED-PROJECT-BROWNFIELD

**Baseline revision:** `cf321c96`  
**Scope:** Store meta-hub comprehension (no REQ promotion)  
**Author / date:** build-plan / 2026-10-31

Copy from `tied-bundle/templates/brownfield-evidence-to-intent-matrix.md`.

---

## Matrix

| # | Claim | Source type | Location | Disposition | Confidence | Proof boundary | REQ/ARCH target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Indexes list 185+ project REQ detail files with valid index keys at sample validate | req | tied-project/requirements.yaml | observed | high | Detail/pseudocode pass deferred | |
| 2 | getBasePath fans out to verify, envelope, citdp-writer, consistency | code_graph | mcp-server/src/yaml-loader.ts#getBasePath | observed | high | Static trace depth 1 | |
| 3 | EDPC access matrix validates at toolchain_readonly | test | tied_edpc_access_validate receipt | observed | high | Does not require pilot mode | |
| 4 | 65 duplicate working CITDP files matched persisted citdp | code | citdp-dedupe-log.md | observed | high | 35 divergent retained unresolved | |
| 5 | Source graph indexes 745 TS/JS files under mcp-server refresh | code_graph | source-graph-index.v1.json | observed | medium | No YAML corpus in graph | |
| 6 | Meta-hub EDPC template not productized | help | PLAN-refine-pass1.md gaps | unresolved | medium | Methodology backlog | |
| 7 | Every REQ Implemented status | req | requirements.yaml statuses | unresolved | low | Requires tied_verify per token | |

---

## Acceptance (pilot)

- [x] 100% rows dispositioned (observed/unresolved only)
- [ ] ≥80% promoted REQ criteria map to IMPL block + evidence location (N/A — no promotion)
- [ ] ARCH decisions cite boundary + rationale (N/A)
- [x] Zero product index YAML diffs
