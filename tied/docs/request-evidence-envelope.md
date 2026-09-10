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
# MCP or tied-cli equivalent
request_evidence_envelope_validate --envelope-path working/REQ-X/evidence/request-evidence-envelope.v1.json
```

Close-out (post Slice 2 hooks): integrated REQs require a valid envelope; minimal depth requires at least one `not_applicable_receipt` artifact entry, not silent absence.

## Comparable arms (no rollup score)

| Arm | Input | Report |
| --- | --- | --- |
| Artifact coverage | `request-evidence-envelope.v1.json` | `envelope-gap-report.v1.yaml` |
| Chain completeness | `evidence-chain-profile.v1` | `evidence-chain-statistics-report.v2` |

Envelope `present` does not imply profile field `observed`.
