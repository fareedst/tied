# Refine notes — Claude harness follow-on REQs

| Field | Value |
| --- | --- |
| **Session** | `refine-plan` pass **3** — 2026-09-23 |
| **Linked plan** | `~/.cursor/plans/claude_harness_follow-on_reqs_ec0ae021.plan.md` |
| **Tracker** | [checklist-tracker.yaml](./checklist-tracker.yaml) (`request: REFINE-CLAUDE_HARNESS_FOLLOWON`) |
| **CITDP persistence** | Authoritative on child REQs: `tied/citdp/CITDP-REQ-TIED_CLAUDE_LIVE_DRIVER.yaml`, `tied/citdp/CITDP-REQ-TIED_CLAUDE_BOOTSTRAP_OPS.yaml`. Refine session uses inline CITDP for gate only. |
| **depth_tier (this session)** | `minimal` — plan/docs reconciliation only |
| **gate_policy** | `advisory` |
| **pre_implementation gate (refine Tracker)** | **allowed: true** — run `refine-followon-pass3-2026-09-23`; receipt `working/REFINE-CLAUDE_HARNESS_FOLLOWON/gates/pre_implementation-2026-09-24T04-48-30-537Z.json`; advisory `minimal_depth_missing_waiver` |

## Pass 3 reconcile (plan vs comparison doc vs repo)

| Topic | Linked plan (pass 2) | Comparison doc | Repo truth | Resolution |
| --- | --- | --- | --- | --- |
| Next step | `/build-plan` B1→A→B2–B5 | Post–Phases table cites B2+B5 green | B1/B2/B4/B5 landed; A Implemented; B3 deferred | Plan → **`/other` Windows CI** + optional B3; archive build-plan remainders |
| Comparison ~L95 | “No Claude .mcp.json” stale | §5 Bootstrap **Current** describes `.mcp.json` + asserts | B5 refreshed doc | Plan stale text removed; CITDP B `current_behavior` still pre-ship wording (LEAP hygiene follow-up) |
| `fixtures/claude/` | “may not exist until RED” | Phase 2 follow-on open | Four NDJSON + README on disk | Plan updated; CITDP A disconfirming observation historical |
| `windows_copy_proven_in_ci` | flip after B1 proof | “still false”; Windows CI pending | Proof note: darwin GREEN, **flag not flipped** | All three aligned — flip remains **Windows runner** only |
| B2 “green” | after flag flip | “B2 + B5 green” | Symlink **unit** tests GREEN; flag false | Comparison means test gate, not production flag — plan clarifies |
| REQ A/B status | plan_stack / pending build | A open, B slices mixed | Both **`Implemented`**, Trackers **closed** | Plan table updated; comparison Phase 2 row → **Implemented** (refine pass 3) |

## Child REQ gates (historical)

| REQ | Verification | Close-out |
| --- | --- | --- |
| REQ-TIED_CLAUDE_LIVE_DRIVER | `working/REQ-TIED_CLAUDE_LIVE_DRIVER/gates/verification-*` | `close_out-*` |
| REQ-TIED_CLAUDE_BOOTSTRAP_OPS | B1 + B2–B5 slice evidence | Tracker closed; commit deferred |

No re-run of per-REQ `pre_implementation` required for refine-only plan edits; **re-run after CITDP hygiene** (pass 3):

| REQ | Result | Receipt |
| --- | --- | --- |
| REFINE-CLAUDE_HARNESS_FOLLOWON | allowed, advisory waiver | `gates/pre_implementation-2026-09-24T04-48-30-537Z.json` |
| REQ-TIED_CLAUDE_BOOTSTRAP_OPS | allowed | `working/REQ-TIED_CLAUDE_BOOTSTRAP_OPS/gates/pre_implementation-2026-09-24T04-48-48-713Z.json` |
| REQ-TIED_CLAUDE_LIVE_DRIVER | allowed | `working/REQ-TIED_CLAUDE_LIVE_DRIVER/gates/pre_implementation-2026-09-24T04-48-49-025Z.json` |

## Next (sponsor)

1. **`/other`** — Windows CI job + update `windows-claude-smoke-proof.md` + flip flag.
2. Optional **`/build-plan` B3** after flip.
3. Sponsor **`traceable-commit`** when ready (B Tracker deferred).
