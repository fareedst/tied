# Refine pass 1 — gate note

- **Request token:** `DOC-ANTHROPIC-FORMAL-VERIFICATION-COMPARISON`
- **Change class:** comparisons doc-only; `profile_depth: minimal`; integrated adversarial inquiry **Defer**
- **Source:** [Anthropic CDN PDF appendix](https://www-cdn.anthropic.com/files/4zrzovbb/website/6867eadf760258fa8b42a504600cd3c036d16358.pdf) (2026-10-22); sponsor supplied full appendix text in chat for Wave 1 normalization
- **Machine gate (2026-10-25):** `tied_checklist_gate_validate` phase=`pre_implementation` → `allowed: false`, `blocking: true`, `diagnostics: ["missing_or_invalid_depth"]` — expected for `DOC-*-COMPARISON` outreach; **build-plan** doc deliverables follow sibling pattern despite blocked machine gate
