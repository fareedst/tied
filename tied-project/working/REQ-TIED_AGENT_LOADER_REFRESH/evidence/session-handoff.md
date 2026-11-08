# Session handoff

| Field | Value |
| --- | --- |
| **handoff_kind** | `session` |
| **date** | 2026-11-08 |
| **request_token** | `REQ-TIED_AGENT_LOADER_REFRESH` |
| **prompt_type** | `close-out` |
| **plan_phase** | `close-out-ready` |
| **execution_site** | TIED store (`/Users/fareed/Documents/dev/chatgpt/stdd`) |

---

## Plan spine

- **PLAN:** [../PLAN.md](../PLAN.md)
- **CITDP (draft):** [../CITDP-REQ-TIED_AGENT_LOADER_REFRESH.draft.yaml](../CITDP-REQ-TIED_AGENT_LOADER_REFRESH.draft.yaml)
- **Tracker:** [../checklist-tracker.yaml](../checklist-tracker.yaml)
- **Test strategy:** [../test-strategy.md](../test-strategy.md)
- **Source Cursor plan:** `~/.cursor/plans/agents_loader_refresh_31112aa5.plan.md`

---

## Plan execution steps

**Last updated:** 2026-11-08 · **prompt_type:** refine-plan · **PLAN:** ../PLAN.md

### Required

- [x] `add-feature-cursor-plan` — Confirmed create-if-absent AGENTS.md; hl7receiver failure mode
- [x] `refine-plan-lock` — PLAN.md, CITDP draft, test-strategy, D-* decisions, build phases S1–S3
- [x] `build-plan-tied-stack` — REQ/ARCH/IMPL + pseudo; CITDP under tied-project/citdp/
- [x] `build-plan-s1-sync` — `agent-loader-sync.mjs` + T1 RED/GREEN
- [x] `build-plan-s2-wire` — db.mjs, bootstrap.mjs, CLI flag + T2
- [x] `build-plan-s3-close` — drift WARN, docs, parent LEAP, CHANGELOG (validate pending)
- [x] `close-out` — envelope, gates, traceable commit

### Optional

- [ ] `operator-spot-hl7receiver` — refresh witness after ship
- [ ] `parity-report-row` — extend client-refresh-parity if WARN insufficient

### Recommendations

- **Reversible:** Sponsor AGENTS edits — use `--preserve-agent-loader` or rely on git.
- **Costly:** Do not extend aggressive sync to `.cursorrules` without new REQ (sponsor scoped AGENTS only).

### Changelog (this REQ)

| Date | prompt_type | Summary |
| --- | --- | --- |
| 2026-11-08 | add-feature | Cursor plan: aggressive AGENTS sync + preserve flag |
| 2026-11-08 | refine-plan | Locked decisions, SC-* criteria, disk artifacts |
| 2026-11-08 | build-plan | Implementation + tests GREEN |
| 2026-11-08 | close-out | Gate r1 allowed; traceable commit |

---

## Environment

| Key | Value |
| --- | --- |
| **Store** | `/Users/fareed/Documents/dev/chatgpt/stdd` |
| **Example stale client** | `/Users/fareed/Documents/persante/repos/hl7receiver` |

---

## Requirements and dependencies

- **Primary:** `REQ-TIED_AGENT_LOADER_REFRESH` (to be authored in build)
- **depends_on:** `REQ-TIED_SETUP`, `REQ-TIED_LAYERED_CLIENT_INSTALL`, `REQ-TIED_INSTALL_JSON_REFRESH_SEMVER`
- **related:** `REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND`, `REQ-TIED_CLIENT_REFRESH_PARITY`

---

## Constraints

- Plan mode: no product code or RED tests in refine leaf.
- Persist formal CITDP under `tied-project/citdp/` only at checklist **`persist-citdp-record`** during build.

---

## Do next

Operator: `./tied-install.sh --refresh` on stale clients (omit `--preserve-agent-loader`) to sync `AGENTS.md`.
