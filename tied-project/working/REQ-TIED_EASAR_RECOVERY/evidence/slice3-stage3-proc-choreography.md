# Stage 3 — PROC choreography (Track C → fidelity → claims)

**Program:** [REQ-TIED_EASAR_RECOVERY](../PLAN.md) · **Slice 3** (PROC evidence only; no Track C automation in MVP)  
**Authority:** [PROC-EASAR_RECOVERY](../../../../tied-bundle/docs/processes.md) · EASAR methodology §7.4

Mode C **Stage 3** is prompt sequencing between graph receipt work (Slice 2) and claims/matrix choreography (Slice 3 Stage 4). Do **not** merge these into one agent prompt.

## Operator sequence

| Step | Role | Artifact / tool |
| --- | --- | --- |
| 1 | Track C — create or refresh IMPL sidecars from code | [impl-pseudocode-from-code-agent-prompt.md](../../../../tied-bundle/docs/impl-pseudocode-from-code-agent-prompt.md) |
| 2 | Fidelity — grade sidecar vs code/tests | [pseudocode-fidelity-audit-agent-prompt.md](../../../../tied-bundle/docs/pseudocode-fidelity-audit-agent-prompt.md) |
| 3 | Claims — freeze surface, classify, append ledger | `tied_claims_evidence_review_run` · output under `tied-project/working/{REQ}/claims-evidence-review/` |
| 4 | Matrix — link `claim.id` ↔ row `#` | `claim-matrix-map.v1` receipt · update [intent-elevation-matrix.md](./intent-elevation-matrix.md) **Location** footnotes only (disposition unchanged unless sponsor promotes) |

## Dogfood note (stdd store)

For `[REQ-TIED_EASAR_RECOVERY]`, Slice 3 build-plan may **skip** steps 1–2 when matrix rows already cite tests/code (rows 1–4). Steps 3–4 remain mandatory for SC-EASAR-CLAIMS.

## Anti-patterns

- Using adversarial inquiry `finding-ledger.jsonl` as the claims-review ledger
- Promoting `observed` matrix rows to REQ without `author-requirement` / sponsor slugs
- Writing claims-review output under `tied-bundle/working/.../adversarial-inquiry/` (inquiry-local root stays inquiry-only)
