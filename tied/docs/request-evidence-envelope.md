# Request evidence envelope — operator guide

**Tokens:** `[REQ-REQUEST_EVIDENCE_ENVELOPE]`, `[ARCH-REQUEST_EVIDENCE_ENVELOPE]`, `[IMPL-REQUEST_EVIDENCE_ENVELOPE]`, `[PROC-REQUEST_EVIDENCE_ENVELOPE]`

Per-REQ machine index at `working/{REQ-TOKEN}/evidence/request-evidence-envelope.v1.json`. Wraps producer artifacts with stable identity, typed cross-references, and explicit `gaps[]` — without mutating inner artifact schemas.

## When to build vs backfill vs patch

| Path | Tool / CLI | Mutates inner artifacts? |
| --- | --- | --- |
| Read-only discovery | `request_evidence_envelope_build` | No |
| Producer hook (live) | `request_evidence_envelope_patch` | No (envelope only) |
| Legacy timestamp repos | `request_evidence_envelope_backfill` | No (envelope + optional N/A receipt) |
| Batch gap report | `request_evidence_envelope_batch_collect` | No (report only) |

## Backfill CLI (Slice 5 migration)

From `mcp-server/` after `npm run build`:

```bash
npm run request-evidence-envelope-backfill -- \
  --project-root /path/to/client \
  --request-token REQ-EXAMPLE
```

Optional flags:

- `--tied-base-path PATH` — defaults to `{project-root}/tied` (or STDD MCP base when project root is the methodology repo)
- `--depth-tier minimal|integrated|strict_candidate` — override CITDP-inferred depth
- `--gate-policy POLICY` — override gate policy on envelope identity
- `--no-write-not-applicable-receipts` — skip N/A receipt stubs (minimal depth only)

**Minimal depth:** when CITDP `depth_tier` is `minimal` and adversarial-inquiry phase dirs are absent, backfill writes `working/{REQ-TOKEN}/evidence/not-applicable-receipt.v1.json` proving intentional skip.

**Integrated legacy:** backfill surfaces gaps from discovery (e.g. `legacy_json_in_json_wrapper` when `citdp-closeout.json` remains; prefer `cross_links.citdp_path` → flat `CITDP-{REQ}.yaml`).

## Evaluation corpus registration

Extend `working/evaluation/evaluation-corpus.v1.yaml` (operator-local, gitignored) per row:

```yaml
  - client_alias: "1788547701"
    class: "tied"
    project_root: "/Users/fareed/Documents/dev/test/1788547701"
    request_token: "REQ-BT_BATTERY_DISPLAY"
    envelope_artifact: "working/REQ-BT_BATTERY_DISPLAY/evidence/request-evidence-envelope.v1.json"
    envelope_require_mode: "require_envelope"
    tied_base_path: "/Users/fareed/Documents/dev/test/1788547701/tied"
```

After Slice 5 pilot, `/dev/test/*` rows use `require_envelope` (fail-closed when envelope missing). Pre-pilot default was `legacy_infer`.

Batch collect:

```bash
npm run request-evidence-envelope-batch-collect -- \
  --corpus ../working/evaluation/evaluation-corpus.v1.yaml \
  --yaml-out ../working/evaluation/envelope-gap-report.v1.yaml
```

## Validate

```bash
# MCP or tied-cli equivalent — schema-only (non-blocking gaps allowed)
request_evidence_envelope_validate --envelope-path working/REQ-X/evidence/request-evidence-envelope.v1.json

# Close-out blocking mode (Wave 1 W1-D3) — fails when any gap has severity:error
request_evidence_envelope_validate \
  --envelope-path working/REQ-X/evidence/request-evidence-envelope.v1.json \
  --fail-on-error-gaps true
```

**Unified close-out:** integrated REQs require gate `allowed: true` **and** envelope validate with `fail_on_error_gaps: true` (zero blocking error gaps). At integrated depth, `fail_on_error_gaps: true` also treats process-adherence warn gaps as blocking unless `fail_on_process_gaps: false` is set explicitly (Wave 6). Advisory policy records observed/unresolved findings as `severity: warn`, not blocking `error`. Minimal depth requires at least one `not_applicable_receipt` artifact entry, not silent absence.

**Wave 6 artifact expectations (warn unless process-strict):**

| Trigger | Expected artifact | Gap code |
|---|---|---|
| Completed verification/test slugs | `verification-evidence-manifest.v1.json` | `expected_artifact_missing` |
| Integrated depth | `evidence-chain-profile.v1.json` | `expected_artifact_missing` |
| Non-empty IMPL inventory + PSA slug completed or integrated depth | `pseudocode-analysis/{IMPL}.v1.json` | `expected_artifact_missing` |

Parent handoff must report machine close-out, process contract, and adherence ledger separately — see `tools/bundled-prompt-type-skills/prompt-shared/completion-signals-handoff.md`.

Canonical replay: `node tools/bootstrap/templates/run-close-out-gates.mjs --envelope-blocking` (see `--help`).

## Comparable arms (no rollup score)

| Arm | Input | Report |
| --- | --- | --- |
| Artifact coverage | `request-evidence-envelope.v1.json` | `envelope-gap-report.v1.yaml` |
| Chain completeness | `evidence-chain-profile.v1` | `evidence-chain-statistics-report.v2` |

Envelope `present` does not imply profile field `observed`.

## Wave 7 operator backfill (tracker-only clients)

When mature `/dev/test` clients have trackers but no `request-evidence-envelope.v1.json`, run the batch wrapper (W7-D2). It invokes `request_evidence_envelope_backfill` per row and **does not** mutate inner producer artifacts (manifest, profile, inquiry packs, PSA files).

From repository root after `npm run build --prefix mcp-server`:

```bash
# Discover all 178* timestamp clients with trackers; skip rows that already have envelopes
node scripts/backfill-client-envelopes.mjs \
  --dev-test-root /Users/fareed/Documents/dev/test \
  --json-out working/evaluation/backfill-client-envelopes-summary.v1.json

# Single client
node scripts/backfill-client-envelopes.mjs \
  --project-root /Users/fareed/Documents/dev/test/1789087315 \
  --request-token REQ-DUPCOMPARE

# Dry-run against evaluation corpus rows
node scripts/backfill-client-envelopes.mjs \
  --corpus working/evaluation/evaluation-corpus.v1.yaml \
  --dry-run
```

**Operator steps:**

1. Confirm `npm run build --prefix mcp-server` so `dist/cli/request-evidence-envelope-backfill.js` exists.
2. Run batch backfill with `--continue-on-error` when piloting a mixed cohort.
3. Re-run `request_evidence_envelope_batch_collect` to refresh `envelope-gap-report.v1.yaml`.
4. Do **not** treat backfill alone as unified close-out — live sessions must still CALL `sub-close-out-evidence-sync`.

See [conversation-analysis-tools.md](./conversation-analysis-tools.md) for W7-D1 transcript scoring (observation-only, not a gate substitute).
