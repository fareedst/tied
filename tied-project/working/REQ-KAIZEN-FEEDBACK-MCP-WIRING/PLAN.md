# REQ-KAIZEN-FEEDBACK-MCP-WIRING — Kaizen MCP composition (Phases 4–7)

**Status (2026-10-08):** **Implemented** — four MCP tools registered; composition tests 4/4; committed locally (publish deferred).

**Program context:** Kaizen orchestrator **EXIT**; Phases 4–7 library modules shipped. This REQ is the **composition layer** deferred in each phase CITDP.

**Artifacts:** [CITDP](./CITDP-REQ-KAIZEN-FEEDBACK-MCP-WIRING.yaml) · [Tracker](./checklist-tracker.yaml) · [Pseudo-code](../../implementation-decisions/IMPL-KAIZEN-FEEDBACK-MCP-WIRING-pseudocode.md) · [Vocab naming bridge](../../vocab/feedback-to-tied.md)

## Governing decisions (unchanged)

| Decision | Value |
| --- | --- |
| `depth_tier` | integrated |
| `gate_policy` | advisory |
| Delegation | Handlers in `mcp-server/src/tools/index.ts` only; **no** algorithm duplication |
| `base_path` | Optional override; else same resolution as `tied_feedback_capture_observation` |
| Canonical TIED YAML | **Never** written from these four tools |
| Methodology YAML | `ARCH-FEEDBACK_STORAGE` / `IMPL-MCP_FEEDBACK_TOOLS` **read-only** in client; trace on **ARCH/IMPL-KAIZEN-FEEDBACK-MCP-WIRING** |

## Four MCP tools — agent contract

All tools return MCP **text** content whose body is JSON: `{ ok: true, ... }` or `{ ok: false, error: "<Code>" }` (plus tool-specific fields on success).

### 1. `tied_feedback_analysis_digest`

**Delegates to:** `buildFeedbackDigest`

| MCP arg | Maps to module |
| --- | --- |
| `cohort` (required object) | `CohortSelector` — at minimum `compatibility_key`; optional `denominator_fingerprint`, `schema_profile`, `client_ids` |
| `window` (optional) | `AnalysisWindow` `{ start?, end? }` ISO strings |
| `denominator_manifest` (optional) | `DenominatorManifestRef` |
| `require_manifest_ref` (optional bool) | same |
| `include_markdown` (optional bool, default true) | when true and digest ok, include `markdown` from `projectFeedbackDigestMarkdown` |
| `base_path` (optional) | `projectRoot` |

**Store effect:** read-only (`storeMutation: false`, `canonicalWrite: false`).

**Composition test (RED):** temp dir + seed `feedback.yaml` from fixture `mcp-server/test/fixtures/kaizen-feedback-analysis/recurrence_duplicate_groups/`; call tool; assert `ok`, `digest.schema_version === "feedback-analysis.v1"`, `projection_hash` present.

### 2. `tied_feedback_review_bridge`

**Delegates to:** `runDigestReviewBridge`

| MCP arg | Maps to module |
| --- | --- |
| `digest` (required object) | `FeedbackAnalysisDigestV1` inline JSON |
| `observation_group` (required string) | duplicate_group id |
| `review` (optional) | `ReviewDecision` — omit → module returns `ReviewRequired` |
| `review_context` (optional) | freshness / projection context |
| `base_path` (optional) | `projectRoot`; loads `entriesById` via `loadFeedback` |

**Store effect:** no change on `ReviewRequired` / reject; **approve path** may append LEAP proposal via existing promotion module (same as unit tests). `canonicalWrite: false`.

**Composition test:** build digest via analysis tool or fixture `expected-digest.json`; call bridge **without** `review`; assert `error === "ReviewRequired"` and no proposal file growth (temp project).

### 3. `tied_feedback_outcome_record`

**Delegates to:** `runOutcomeLoop`

| MCP arg | Maps to module |
| --- | --- |
| `payload` (required object) | `OutcomeObservationPayload` — field name is **`entry_id`** (not `feedback_entry_id`) |
| `follow_up_window` (required object) | `{ start?, end? }` |
| `base_path` (optional) | `projectRoot` |

**Store effect:** on success, module **appends** `context.outcome_observations[]` on the target entry (same as Phase 6 unit tests). Not a canonical YAML write.

**Composition test:** seed entry with `baseline_ref` in context; call with window excluding `observed_at` → assert structured error (e.g. `OutsideFollowUpWindow`); do not assert full happy path in composition if covered by module tests—one error path + optional minimal success with fixture from `kaizen-outcome-loop/`.

### 4. `tied_feedback_pilot_run`

**Delegates to:** `runKaizenFeedbackPilot`

| MCP arg | Maps to module |
| --- | --- |
| `spec` (required object) | `PilotSpec` — see `kaizen-feedback-pilot/named_metrics_denominators/params.json` |
| `pilot_incident_signals` (optional string[]) | privacy / stop-criteria inputs |
| `report_out_path` (optional) | export-only write of report JSON; omit in MCP default |
| `base_path` (optional) | `projectRoot` |

**Store effect:** read-only on `feedback.yaml` (`storeMutation: false`). Report is returned in JSON; file write only when `report_out_path` set.

**Composition test:** cohort too small → `InvalidPilotCohort` or module error code in JSON.

## build-plan execution order (Implement)

1. **Imports** in `tools/index.ts`: `buildFeedbackDigest`, `runDigestReviewBridge`, `runOutcomeLoop`, `runKaizenFeedbackPilot`, `loadFeedback`, existing `getBasePath` / path helpers.
2. **Register** four tools immediately after `tied_feedback_promote` (keep feedback tools grouped).
3. **Zod schemas:** `z.record(z.unknown())` for nested objects where needed; validate required keys in handler before delegate (match pseudo-code FAILURE_MODES).
4. **RED:** add `mcp-server/src/tools/kaizen-feedback-mcp-composition.test.ts` (pattern: `batch-5-mcp.test.ts` kaizen capture block).
5. **GREEN:** handlers only; no changes to Phase 4–7 module files unless LEAP exposes a typing gap.
6. **`npx tsc -b`** (mcp-server); run composition test file + existing kaizen module tests.
7. **Verification gate** + **`tied_verify`**; **plan-close-out** + **git commit** (sponsor asked for commit on build-plan close-out).

## Hygiene (refine pass)

- Remove mistaken nested paths under `working/REQ-KAIZEN-FEEDBACK-MCP-WIRING/evidence/tied-project/` (wrong-root MCP artifact copies) during build-plan workspace prep.
- Fix pseudo-code comment `feedback_entry_id` → **`entry_id`** to match `OutcomeObservationPayload` (doc-only in sidecar if build-plan touches it).

## Out of scope

- Phase 3 transport / notification MCP
- New digest or pilot algorithms
- Editing methodology-owned `tied-bundle/` ARCH/IMPL detail files
