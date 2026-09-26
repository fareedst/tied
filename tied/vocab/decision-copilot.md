# decision-copilot (canonical)

**Scope:** Optional **System One** decision APIs (Jev) as a fast judgment **coprocessor** inside TIED operator surfaces. Deterministic MCP gates and the token graph remain authoritative.

**Traceability:** [REQ-TIED_JEV_DECISION_COPROCESSOR](../requirements/REQ-TIED_JEV_DECISION_COPROCESSOR.yaml) · [ARCH-TIED_JEV_DECISION_COPROCESSOR](../architecture-decisions/ARCH-TIED_JEV_DECISION_COPROCESSOR.yaml) · [IMPL-TIED_JEV_DECISION_COPROCESSOR](../implementation-decisions/IMPL-TIED_JEV_DECISION_COPROCESSOR.yaml)

**See also:** [`routing.md`](routing.md) · [`prompt-composer.md`](prompt-composer.md) · [`fidelity-research.md`](fidelity-research.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
|-----------|-------|-------|
| **System One model** | small LLM, classifier LLM | Typed decisions only; no prose generation |
| **decision coprocessor** | Jev agent | Advises; code and deterministic gates commit outcomes |
| **noul gate** | boolean LLM output | Calibrated 0–1 yes/no; threshold policy is code-owned |
| **speculative fan-out** | sequential LLM chain | Many `questions` in one `/v1/decide` call |
| **shadow routing** | replace routing.md | Log Jev glossary picks vs keyword PRELOAD without changing behavior |
| **Jev ready-made API** | custom decide only | Shortcuts such as agent risk, context filter, model route |
| **confidence threshold policy** | magic cutoff | Pinned per model version; medium → confirm, low → escalate |
| **`jev_data_tier`** | GDPR mode (alone) | `standard_us` for US operator; `eu_strict` optional per client CITDP |
| **fail-closed tool block** | Auto Mode (Cursor) | W5 harness may deny high-risk tools; deny if Jev unavailable for blocking set |

---

## Naming bridge

| Concept | Env / path | Role |
|---------|------------|------|
| API key | `JEV_API_KEY` | Server-side only; `jv_live_*` |
| Model pin | `JEV_MODEL` | Default `jev-1.13.0` |
| API base | `JEV_API_BASE` | Default `https://jevtypesafeai.com/api` |
| HTTP client | `mcp-server/src/jev/` | W1 `jevDecide` wrapper |
| Shadow PRELOAD replay | `mcp-server/scripts/replay-jev-vocab-shadow.ts` | W2 keyword vs Jev JSONL log |
| Prompt-type advisory | `advisePromptTypes` in `mcp-server/src/jev/` | W3 explicit-name heuristic + Jev hint |
| Adversarial triage pilot | `runAdversarialTriagePilot` | W4 observation-only nouls; no finding-ledger |

---

## Alphabetical index

| Term | Section |
|------|---------|
| confidence threshold policy | Preferred terms |
| decision coprocessor | Preferred terms |
| fail-closed tool block | Preferred terms |
| jev_data_tier | Preferred terms |
| Jev ready-made API | Preferred terms |
| noul gate | Preferred terms |
| shadow routing | Preferred terms |
| speculative fan-out | Preferred terms |
| System One model | Preferred terms |
