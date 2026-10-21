# Test strategy — REQ-TIED_HARNESS_LANGSMITH_COMPOSE

| Field | Content |
| --- | --- |
| **RED command(s)** | `node --test tools/bootstrap/lib/harness-trace-langsmith-compose-skill.test.mjs tools/bootstrap/lib/export-langsmith-traces.test.mjs` (before skill/script GREEN); extend `harness-trace-observation-loop-doc.test.mjs` markers RED-first |
| **Green command(s)** | `node --test tools/bootstrap/lib/harness-trace-langsmith-compose-skill.test.mjs tools/bootstrap/lib/export-langsmith-traces.test.mjs tools/bootstrap/lib/harness-trace-observation-loop-doc.test.mjs` |
| **Enrollment** | `npm test --prefix mcp-server -- --test-name-pattern enrollment` (or full methodology-production-system-enrollment.test.ts) |
| **E2E bundle** | `npm test --prefix mcp-server -- src/e2e/prompt-type-skills.test.ts` |
| **Verification gate** | `tied_checklist_gate_validate` phase `verification` with Tracker under `tied-project/working/REQ-TIED_HARNESS_LANGSMITH_COMPOSE/` |
| **Proof line** | Model self-check is **not** sole proof; exit code 0 on listed commands + gate receipt required |
| **Live LangSmith API smoke** | **not_applicable** (sponsor `/unblock` 2026-10-21 — no `LANGSMITH_API_KEY`); proof is **no-network** CLI contract tests in `export-langsmith-traces.test.mjs` only |
