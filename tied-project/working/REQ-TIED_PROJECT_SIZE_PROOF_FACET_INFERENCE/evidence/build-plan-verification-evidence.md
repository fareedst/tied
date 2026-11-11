# Build-plan verification — REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE

**date:** 2026-11-10

```bash
cd mcp-server && npm test -- --test-path-pattern=project-size
```

Exit 0 after unit count fixture update.

`validator_version`: **1.2.0**  
`label_case_counts`, `composition_inferred_cases`, `proof_inference_diagnostics` on snapshot.

Batch: `--fine-labels` on `project-size-batch-compare.mjs`.
