# Test strategy — Wave 3 Phase 3

| Layer | Command / file |
| --- | --- |
| Doc compose | `node --test tools/bootstrap/lib/tests-checker-claim-compose-doc.test.mjs` |
| Matrix row 16 | `node --test tools/bootstrap/lib/methodology-composition-matrix-anthropic-fv-row.test.mjs` |
| Envelope advisory | `cd mcp-server && npx tsx --test src/request-evidence-envelope/checker-backed-envelope-proof.test.ts` |
| TypeScript | `npx tsc -b` |
| Pseudo-code | `pseudocode_validate IMPL-TIED_CHECKER_BACKED_ENVELOPE_PROOF` |
| TIED | `tied_validate_consistency`; `lint_yaml` on changed project YAML |

**Order:** RED doc + matrix + envelope tests → TIED YAML + sidecar → production code → GREEN.
