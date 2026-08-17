# Staged feature demo

```bash @on-load @hide
cd "$INDESCRIPT_DOC_DIR/.." # from 'docs'
source ~/.bash_profile

export ROOT="$(pwd)"

export ONBOARD="$ROOT/mcp-server/dist/feature-orchestration/onboarding-entry.js"
export SERVER="$ROOT/mcp-server/dist/index.js"

export TIED_CLI_SH="$ROOT/.cursor/skills/tied-yaml/scripts/tied-cli.sh"
export TIED_MCP_BIN="$SERVER"
```
This is a disposable, copy-paste demo for the staged feature-orchestration
surface. It uses a temporary project and does not write this repository's
project YAML. Generated views remain projections, not canonical records or
runtime proof.

## 1. Build and isolate

```bash @eval
npm --prefix "$ROOT/mcp-server" run build
```

Run from the TIED repository root:
```ux @req(DEMO) @hide
prompt: Delete the dir
exec: |
  cd "$ROOT"
  [ -w "$DEMO" ] && rm -rf "$DEMO"
  printf 0
init: false
name: DEMO
```
```ux
exec: >-
  mktemp -q -d "${TMPDIR:-/tmp}/tied-feature-demo.XXXXXX"
init: false
name: DEMO
transform: :chomp
```
- @prompt-as-button(DEMO)

```bash @n:new_demo_dir @hide
DEMO="$(mktemp -d "${TMPDIR:-/tmp}/tied-feature-demo.XXXXXX")"
cleanup() {
  cd "$ROOT"
  [ -w "$DEMO" ] && rm -rf "$DEMO"
  unset TIED_BASE_PATH TIED_MCP_BIN
}
trap cleanup EXIT
```
```bash @n:in_demo_dir @hide
cd "$DEMO"
```

```bash @hide @n:with_tied_fn @r:in_demo_dir
export TIED_BASE_PATH="$DEMO/tied"

tied() {
  echo_exec node "$ONBOARD" "$@"
}

tied_mcp() {
  export TIED_BASE_PATH="$DEMO/tied"
  export TIED_MCP_BIN="$SERVER"
  echo_exec "$TIED_CLI_SH" "$@"
}
```

The installed product command is equivalent to `node "$ONBOARD" ...`; use
`tied` below when the `feature-orchestrator` package bin is installed.

## 2. Onboarding and brownfield-safe creation

```bash @r:with_tied_fn @eval @req(DEMO)
tied init
```
<!--
{
  "ok": true,
  "command": "init",
  "delegate": "feature-orchestrator bootstrap boundary",
  "result": {
    "base_path": "/var/folders/yh/87t3kcg50_l108hdt9tgc8pr0000gp/T/tied-feature-demo.4BCJVV/tied",
    "feature_directory": "/var/folders/yh/87t3kcg50_l108hdt9tgc8pr0000gp/T/tied-feature-demo.4BCJVV/tied/features",
    "source_report": {
      "mcp_bin": {
        "value": "/Users/fareed/Documents/dev/chatgpt/stdd/mcp-server/dist/index.js",
        "source": "environment",
        "exists": true,
        "corrective_command": "npm run build --prefix mcp-server"
      },
      "base_path": {
        "value": "/var/folders/yh/87t3kcg50_l108hdt9tgc8pr0000gp/T/tied-feature-demo.4BCJVV/tied",
        "source": "environment",
        "exists": false,
        "corrective_command": "mkdir -p \"/var/folders/yh/87t3kcg50_l108hdt9tgc8pr0000gp/T/tied-feature-demo.4BCJVV/tied\""
      },
      "constitution": {
        "value": "/var/folders/yh/87t3kcg50_l108hdt9tgc8pr0000gp/T/tied-feature-demo.4BCJVV/tied/constitution.yaml",
        "source": "environment",
        "exists": false,
        "corrective_command": "cp tied/constitution.example.yaml \"/var/folders/yh/87t3kcg50_l108hdt9tgc8pr0000gp/T/tied-feature-demo.4BCJVV/tied/constitution.yaml\""
      },
      "feature_directory": {
        "value": "/var/folders/yh/87t3kcg50_l108hdt9tgc8pr0000gp/T/tied-feature-demo.4BCJVV/tied/features",
        "source": "environment",
        "exists": false,
        "corrective_command": "mkdir -p \"/var/folders/yh/87t3kcg50_l108hdt9tgc8pr0000gp/T/tied-feature-demo.4BCJVV/tied/features\""
      },
      "mutating": false
    }
  },
  "next_action": "tied feature new \"Describe the feature\"",
  "advanced_paths": [
    ".cursor/skills/tied-yaml/scripts/tied-cli.sh",
    "TIED YAML MCP",
    "tools/agentstream",
    "tied/docs/using-tied-without-mcp.md"
  ],
  "mutated_configuration": false
}
-->

```bash @n:tied-feature-new @r:with_tied_fn @append-output
yaml=`tied feature new "Add count-lines CLI"`
printf 'FEATURE_ID='
echo "$yaml" | yq .result.manifest.feature_id
```
- FEATURE_ID: ${FEATURE_ID}
<!--
{
  "ok": true,
  "command": "feature new Add count-lines CLI",
  "delegate": "FeatureStore.createIdempotently",
  "result": {
    "ok": true,
    "outcome": "created",
    "manifest": {
      "schema_version": "feature-manifest.v1",
      "feature_id": "FEAT-001",
      "slug": "add-count-lines-cli",
      "title": "Add count-lines CLI",
      "mode": "greenfield",
      "status": "draft",
      "revision": 1,
      "created_at": "2026-08-14T05:17:00.765Z",
      "updated_at": "2026-08-14T05:17:00.765Z",
      "canonical_tokens": {
        "requirements": [], "architecture": [], "implementations": []
      },
      "artifacts": [],
      "open_questions": [],
      "dependencies": [],
      "tasks": [],
      "history": []
    }
  },
  "next_action": "tied feature build --feature FEAT-001",
  "advanced_paths": [
    ".cursor/skills/tied-yaml/scripts/tied-cli.sh",
    "TIED YAML MCP",
    "tools/agentstream",
    "tied/docs/using-tied-without-mcp.md"
  ],
  "mutated_configuration": false
}
-->
```bash @r:with_tied_fn @eval @req(FEATURE_ID)
tied feature build "$FEATURE_ID"
```

Expected: `tied init` reports the resolved `tied/` and `tied/features/`
paths without persisting configuration; `feature new` creates `FEAT-001`;
`feature build` reports the readiness/task/view/agentstream delegation path.
The staged onboarding adapter currently accepts the feature identifier as the
third positional argument.

Check the explicit offline fallback without changing configuration:

```bash @req(DEMO) @eval
export TIED_BASE_PATH="$DEMO/offline/tied"
export TIED_MCP_BIN="$DEMO/missing-mcp-server.js"
echo_exec node "$ONBOARD" init
```

Expected: an actionable readiness diagnostic points to
`tied/docs/using-tied-without-mcp.md`, and `mutated_configuration` remains
`false`.

Prove idempotency and the distinct brownfield mode through the MCP surface:

```bash @r:with_tied_fn @eval
tied_mcp feature_create \
  '{"request_key":"demo-brownfield","title":"Retrofit count-lines","mode":"brownfield"}'
tied_mcp feature_create \
  '{"request_key":"demo-brownfield","title":"Retrofit count-lines","mode":"brownfield"}'
```

The first result is `created`; the second is `existing` with the same
feature identifier. This exercises [REQ-FEAT_IDEMPOTENT_CREATION] and
[REQ-FEAT_ONBOARDING_COMMANDS] without replacing existing TIED records.

## 3. Lifecycle, revision safety, and views

The second feature is normally `FEAT-002`. Advance it with explicit evidence:

```bash @r:with_tied_fn @eval
tied_mcp feature_specify \
  '{"feature_identifier":"FEAT-002","expected_revision":1}'
```

Each successful mutation increments `revision`. Before continuing, exercise
the revision-safe write boundary with a legal transition carrying an old
revision:

```bash @r:with_tied_fn @eval
stale="$(tied_mcp feature_refine \
  '{"feature_identifier":"FEAT-002","expected_revision":1}')"
printf '%s\n' "$stale"
```

This must return `ok: false` with `error: "STALE_REVISION"` and leave the
manifest at revision 2. Continue with the current revision:

```bash @r:with_tied_fn @eval
tied_mcp feature_refine \
  '{"feature_identifier":"FEAT-002","expected_revision":2}'
tied_mcp feature_plan \
  '{"feature_identifier":"FEAT-002","expected_revision":3,"command_input":{"validated":true}}'
tied_mcp feature_tasks \
  '{"feature_identifier":"FEAT-002","expected_revision":4,"command_input":{"planned":true}}'
tied_mcp feature_verify \
  '{"feature_identifier":"FEAT-002","expected_revision":5,"command_input":{"tasked":true}}'
tied_mcp feature_close_out \
  '{"feature_identifier":"FEAT-002","expected_revision":6,"command_input":{"verified":true}}'
```

Render a reference-only generated view and then check stale detection:

```bash @r:with_tied_fn @eval
cat > "$DEMO/view-args.json" <<'JSON'
{
  "view_kind": "spec.md",
  "source_input": {
    "feature_manifest": {
      "schema_version": "feature-manifest.v1",
      "feature_id": "FEAT-002",
      "slug": "retrofit-count-lines",
      "title": "Retrofit count-lines",
      "mode": "brownfield",
      "status": "draft",
      "revision": 1,
      "created_at": "2026-08-13T00:00:00.000Z",
      "updated_at": "2026-08-13T00:00:00.000Z",
      "canonical_tokens": {
        "requirements": [],
        "architecture": [],
        "implementations": []
      },
      "artifacts": [],
      "open_questions": [],
      "dependencies": [],
      "tasks": [],
      "history": []
    },
    "canonical_record_refs": [],
    "evidence_links": ["demo/unit-tests"],
    "proof_boundaries": [
      "specification completeness only",
      "generated structure is not runtime correctness"
    ]
  }
}
JSON

tied_mcp feature_view_render @"$DEMO/view-args.json" > "$DEMO/view-response.json"
node - "$DEMO/view-response.json" "$DEMO/spec.md" <<'NODE'
const fs = require("node:fs");
const response = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
if (!response.ok) throw new Error(JSON.stringify(response));
fs.writeFileSync(process.argv[3], response.markdown);
NODE

cat > "$DEMO/stale-args.json" <<'JSON'
{
  "generated_view": "REPLACE_WITH_SPEC_MD",
  "current_source_revision": [
    {
      "identity": "feature-manifest",
      "source_kind": "manifest",
      "revision_or_hash": "revision:2"
    }
  ],
  "policy": "fail",
  "view_path": "spec.md"
}
JSON
node - "$DEMO/spec.md" "$DEMO/stale-args.json" <<'NODE'
const fs = require("node:fs");
const viewPath = process.argv[2];
const argsPath = process.argv[3];
const args = JSON.parse(fs.readFileSync(argsPath, "utf8"));
args.generated_view = fs.readFileSync(viewPath, "utf8");
fs.writeFileSync(argsPath, JSON.stringify(args));
NODE
tied_mcp feature_view_check_stale @"$DEMO/stale-args.json"
```

Expected: the view contains the generated-view banner and proof-boundary
labels; stale checking reports the revision mismatch under the explicit
`fail` policy. Use `"policy":"warn"` to demonstrate a non-blocking local
inspection.

Run the focused module tests for clarification, constitution, task
readiness/parallel safety, views, and execution state:

```bash @eval
node --test \
  "$ROOT"/mcp-server/dist/feature-orchestration/{clarification,constitution,readiness,task-graph,views,execution-state}.test.js
```

## 4. Brownfield migration: preview before publish

```bash @r:with_tied_fn @eval
mkdir -p "$DEMO/prompts"
printf '%s\n' \
  'specs:' \
  '  - id: legacy-count-lines' \
  '    title: Legacy count-lines' \
  > "$DEMO/prompts/initial-specs.yaml"

tied feature migrate --source "$DEMO/prompts/initial-specs.yaml"
tied feature migrate --source "$DEMO/prompts/initial-specs.yaml" --confirm-migration
```

The first command is non-mutating and reports `writes_planned: false`,
normalized source order, conflicts, and a `preview_hash`. The confirmed
command creates a backup under `.tied-migration-backups/` before publishing
brownfield manifests. Never use the confirmation command against a real
project until the preview and conflict report have been reviewed.

## 5. Operational evidence and feedback

Use the disposable TIED base for the Batch 5 loop:

```bash @r:with_tied_fn @eval
tied_mcp tied_research_record_add "$(cat <<JSON
{
  "record": {
    "record_type": "experiment",
    "source": "feature-demo",
    "source_date": "2026-08-13",
    "method": "focused staged-feature tests",
    "conclusion": "The orchestration boundaries are deterministic for this demo.",
    "uncertainty": "This is not production-scale evidence.",
    "affected_decisions": {"architecture": [], "implementation": []},
    "evidence_provenance": {
      "revision": "working-tree",
      "environment": "local",
      "command": "npm test",
      "result": "passed",
      "artifacts": ["mcp-server/dist/feature-orchestration"]
    },
    "freshness_policy": {"max_age_days": 30, "unknown_date": "stale"},
    "classification": "candidate_finding"
  },
  "audited_project_root": "$DEMO",
  "dataset_path": "$DEMO/research-dataset.jsonl",
  "evaluated_at": "2026-08-13T00:00:00.000Z"
}
JSON
)"

tied_mcp tied_feedback_add \
  '{"type":"methodology_improvement","title":"Demo observation","description":"The staged feature flow is easy to inspect in a disposable project.","include_report_snippet":true}'
tied_mcp tied_feedback_export '{"format":"markdown"}'

tied_mcp tied_feedback_promote "$(cat <<JSON
{
  "entry": {
    "id": "fb-op-demo",
    "type": "bug_report",
    "title": "Demo operational observation",
    "description": "A reviewed operational observation for the feature demo.",
    "created_at": "2026-08-13T00:00:00.000Z",
    "source_type": "test_failure",
    "source_id": "demo-test-1",
    "affected_feature": "FEAT-002",
    "severity": "low",
    "evidence_links": ["$DEMO/research-dataset.jsonl"],
    "duplicate_group": "fg-demo",
    "promotion_status": "promotion_pending"
  },
  "project_root": "$DEMO",
  "canonical_write": false,
  "review": {
    "reviewer": "demo-reviewer",
    "decision": "create_proposal",
    "rationale": "Create a non-canonical proposal for later review.",
    "evidence_links": ["$DEMO/research-dataset.jsonl"]
  }
}
JSON
)"
```

Expected: research output includes freshness and its proof boundary; feedback
promotion creates a reviewed non-canonical LEAP proposal. It must not write
canonical REQ, ARCH, or IMPL YAML.

## 6. Close the proof loop

Run the full implementation tests, then validate the repository's canonical
TIED tree separately:
<!-- couple of minutes, use interactive -->
```bash @r:in_demo_dir @r:with_tied_fn
npm --prefix "$ROOT/mcp-server" test

TIED_BASE_PATH="$ROOT/tied" TIED_MCP_BIN="$SERVER" \
  "$TIED_CLI_SH" tied_config_get_base_path '{}'
TIED_BASE_PATH="$ROOT/tied" TIED_MCP_BIN="$SERVER" \
  "$TIED_CLI_SH" tied_validate_consistency \
  '{"include_detail_files":true,"include_pseudocode":true,"require_detail_record":true}'
TIED_BASE_PATH="$ROOT/tied" TIED_MCP_BIN="$SERVER" \
  "$TIED_CLI_SH" tied_scoped_analysis_run '{"mode":"traceability_gap_report"}'
```

A successful demo distinguishes:

- lifecycle/readiness: legal transitions, gates, and stale revisions;
- traceability: canonical token links and consistency validation;
- generated views: deterministic projections and freshness only;
- runtime correctness: passing tests, not Markdown generation;
- quality/research: provenance and explicit proof boundaries;
- promotion/migration: review, backup, and confirmation, never silent writes.
