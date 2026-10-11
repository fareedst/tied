# Intent elevation matrix — {REQ-TOKEN}

**Baseline revision:** `{GIT_SHA}`  
**Scope tokens:** {LIST}  
**Author / date:** {NAME} / {DATE}

Copy from `tied-bundle/templates/brownfield-evidence-to-intent-matrix.md` per [working-artifact-placement.md](../docs/working-artifact-placement.md).

---

## Legend

| Column | Description |
| --- | --- |
| Claim | Testable statement (not sidecar prose paste) |
| Source type | `code` \| `impl_sidecar` \| `test` \| `help` \| `arch` \| `req` |
| Location | Path or block id + revision |
| Disposition | `observed` \| `approved` \| `unresolved` \| `rejected` |
| Confidence | `high` \| `medium` \| `low` |
| Proof boundary | What this row does **not** prove |
| REQ/ARCH target | Token + field (if promoted) |

---

## Matrix

| # | Claim | Source type | Location | Disposition | Confidence | Proof boundary | REQ/ARCH target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | | | | observed | | | |

---

## Acceptance (pilot)

- [ ] 100% rows dispositioned
- [ ] ≥80% promoted REQ criteria map to IMPL block + evidence location
- [ ] ARCH decisions cite boundary + rationale
- [ ] Zero product behavior diffs (YAML-only pass)
