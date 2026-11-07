# sub-close-out-evidence-sync — REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3

**Date:** 2026-11-07

Command:

```bash
node tools/bootstrap/templates/run-close-out-gates.mjs \
  --project-root /Users/fareed/Documents/dev/chatgpt/stdd \
  --request-token REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3 \
  --tracker-path tied-project/working/REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3/checklist-tracker.yaml \
  --citdp-path tied-project/citdp/CITDP-REQ-TIED_NETFLIX_ONTOLOGY_OBSERVABILITY_WAVE3.yaml \
  --phase close_out \
  --envelope-blocking \
  --sync-dispositions \
  --reconcile \
  --run-id close-out-netflix-wave3-2026-11-07
```

Outcome: `merged_decision.allowed=true`, envelope `blocking_gap_count=0`.

Artifacts:

- [closeout-run-close-out-gates-final.json](./closeout-run-close-out-gates-final.json)
- [verification-evidence-manifest.v1.json](./verification-evidence-manifest.v1.json)
- [request-evidence-envelope.v1.json](./request-evidence-envelope.v1.json)
