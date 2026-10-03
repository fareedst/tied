# Git-hygiene receipt — post Laya / local provider close-out

**Date:** 2026-09-30  
**Run-id:** `jev-laya-post-closeout-git-hygiene-2026-09-30`  
**Manifest base commit:** `3306346` (REQ-TIED_JEV_LOCAL_DECISION_PROVIDER close-out)  
**landed_commit:** this file’s commit on `main` (verify: `git log -1 --oneline -- evidence/git-hygiene-receipt-2026-09-30.md`)

## Scope

Follow-on hygiene after two program commits (`afab2da` doc comparison, `3306346` local decision provider). Cleans ephemeral local churn, lands deferred DX/test fixes, and syncs DOC-JEV-LAYA gate ledger lines omitted from commit 1.

## Delivered

| Area | Artifacts |
| --- | --- |
| CI / scripts | `scripts/build-commands.sh` — explicit `\|\| exit 1` on each `test-all` subshell step |
| Client refresh | `scripts/refresh-tied-client.sh` — methodology refresh helper (Parity B / vocab flags) |
| Tests | Isolate `TIED_BASE_PATH` in onboarding + yaml canonicalizer + client styling MCP tests |
| Gates | `gates/ledger.jsonl` + `close_out-2026-10-01T03-13-05-528Z.json` for doc Laya close-out run |
| Gitignore | `working/**/tied-validate-consistency*.json` under ephemeral block |

## Restored (not committed)

| Path | Reason |
| --- | --- |
| Adversarial fixture `request-evidence-envelope.v1.json` (×2) | Local `generated_at` / revision only |
| `context-pruning-benchmark.v1.json` | Regenerated `git_rev` / timestamp |
| `REQ-TIED_SETUP.yaml`, `CITDP-REQ-TIED_SETUP-CURSOR-CLI-NAME.yaml` | Unrelated quote-canonicalization WIP |
| Checklist gate fixture `regression-manifest.json` | Local fixture drift |

## Left dirty / untracked (intentional)

| Path | Disposition |
| --- | --- |
| `tied/citdp/CITDP-REQ-USPS_ADDRESS_VERIFICATION.yaml` | Separate REQ; do not fold into Jev hygiene |
| `working/REQ-TIED_JEV_TOOL_SAFETY_GATING/gates/ledger.jsonl` | Other REQ W5 scratch (gitignored except negated tree) |
| `tied-validate-consistency*.json` under working | Ephemeral MCP snapshots — now gitignored |

## Program status (unchanged)

- **REQ-TIED_JEV_DECISION_COPROCESSOR / LOCAL_DECISION_PROVIDER:** no MCP status writes this pass.

## Gitignore hygiene ([PROC-GITIGNORE_CLOSE_OUT])

**Applied unstaged → committed:** `working/**/tied-validate-consistency*.json` (+ comment block neighbor); no new `!` negations.

## Completion signals (hygiene pass)

- **Tests:** `bun test` onboarding + yaml-canonicalizer + yaml-client-styling-mcp — **29 pass**.
- **Machine close-out:** n/a (hygiene only; no envelope).
- **Adherence ledger:** doc Laya `close_out` events appended to tracked `ledger.jsonl`.

## Cursor plan

[jev_laya_close-out_commits_c75ef69a.plan.md](file:///Users/fareed/.cursor/plans/jev_laya_close-out_commits_c75ef69a.plan.md) (post-close-out hygiene section implied by sponsor `git-hygiene`).
