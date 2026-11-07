# PLAN — REQ-TIED_METHODOLOGY_RELEASE_4_1_0

**Status:** refine-plan complete (README blurb) · **Handoff:** `@close-out` (or one-line `@build-plan` if blurb not yet applied)

**Profile:** `depth_tier: minimal` · `gate_policy: advisory`

**Sponsor intent (locked):** Bump **TIED methodology semver** **4.0.0 → 4.1.0**; **move entire `[Unreleased]` CHANGELOG into `## [4.1.0]`** (with release date); **commit `tied-bundle/install.json` after store `tied-install --refresh`** so `tied_version` witnesses 4.1.0. No mandatory per-turn `TIEDv` stamp.

---

## Refine summary (2026-11-07)

- **Changelog:** Sponsor — **full** `[Unreleased]` body becomes **`## [4.1.0] - {YYYY-MM-DD}`**; leave a minimal empty `[Unreleased]` header for future work (no bullet drift).
- **install.json:** Sponsor — run **`./tied-install.sh --refresh`** (or store-equivalent) on this repo **before** close-out; **stage and commit** `tied-bundle/install.json` with `tied_version: "4.1.0"` in the release commit (store witness, not hand-edited JSON).
- **Pre-implementation gate:** Pass unwrapped inner CITDP body to `tied_checklist_gate_validate`.

## Refine summary (2026-11-07) — README release blurb

- **Sponsor:** Add a **short store README skim** for **4.1.0** (optional item from build → **locked in** for close-out).
- **Placement:** After the opening paragraph (line 5), **before** `## How to use this README`. **No new H2** — preserves three-band H2 order (`Quick start` → `Explore TIED` → `Install and use`) per [store-readme-structure.test.ts](mcp-server/src/store-readme-structure.test.ts).
- **Shape:** Bold lead-in `**Release highlights (4.1.0):**` + one-sentence pointer to CHANGELOG + **5 bullets** (operator-facing themes, not trial readout inventory).
- **Verification:** `npm test --prefix mcp-server -- src/store-readme-structure.test.ts` green; bullet must link [CHANGELOG.md#410---2026-11-07](CHANGELOG.md#410---2026-11-07).

### Approved copy (insert verbatim)

```markdown
**Release highlights (4.1.0):** Methodology minor release since 4.0.0 — disk-first plan handoffs, runtime configuration on disk, WF trial hardening, and MCP observability. Full notes: [CHANGELOG — 4.1.0](CHANGELOG.md#410---2026-11-07).

- **Plan handoff on disk** — session-handoff **Plan execution steps** across Prompt Composer skills ([REQ-TIED_PROMPT_SKILL_DISK_HANDOFF]).
- **Semver on demand** — no mandatory per-turn `TIEDv` stamp; read version via MCP **`server_info`** ([REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND]).
- **MCP `server_info`** — redacted identity, compatibility, runtime, and health snapshot ([REQ-MCP_SERVER_INFO]).
- **Runtime disk config & env policy** — operator toggles and first-party env catalog on refresh paths ([REQ-TIED_RUNTIME_DISK_CONFIG], [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY]).
- **WF trials & prompt-type skills** — four-phase disposable cohort playbooks, TypeScript implementation stack, 18-leaf skill inventory ([REQ-WF_TRIAL_FOUR_PHASE_HARDENING], [REQ-PROMPT_TYPE_SKILL_EXECUTION_MODE]).
```

---

## Problem

- Root **`VERSION`** and **`AGENTS.md`** still read **4.0.0** while **[Unreleased]** CHANGELOG already documents multiple shipped capabilities.
- **`server_info.extensions.tied.methodology`** should report **4.1.0** after this release.
- Live tests/contracts pin **4.0.0**; historical trial/fixture trees stay frozen.

---

## Locked decisions

| Topic | Decision |
|-------|----------|
| **Semver class** | **Minor** **4.1.0** |
| **Source of truth** | Repo-root **`VERSION`**; **`AGENTS.md`** `**TIED Methodology Version**:` must match |
| **Stamp policy** | **`server_info`** only ([REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND]) |
| **Changelog** | **All** current `[Unreleased]` entries → **`[4.1.0]`** (sponsor, no trim) |
| **install.json** | **Refresh then commit** store `tied-bundle/install.json` with `tied_version: "4.1.0"` |
| **Historical artifacts** | `docs/demos/`, `FACILITATOR-*`, frozen envelope fixtures: **no** version rewrites unless live test asserts current semver |
| **Live pins** | `server_info` example, methodology version tests, README/loader lines, envelope tests for **current** store |
| **README blurb** | Approved copy above; link to CHANGELOG `4.1.0` anchor; no new top-level H2 |

---

## Proposed token

**`[REQ-TIED_METHODOLOGY_RELEASE_4_1_0]`**

**Depends on:** `[REQ-TIED_SETUP]`, `[REQ-TIED_METHODOLOGY_VERSION_ON_DEMAND]`, `[REQ-REQUEST_EVIDENCE_ENVELOPE]`

**Satisfaction criteria:**

1. `VERSION` === `4.1.0`; `readTiedMethodologyVersion` and `server_info` return `4.1.0`.
2. `AGENTS.md` (and methodology loaders that echo version) aligned.
3. Live test/contract pins updated; frozen paths untouched per inventory.
4. **`CHANGELOG.md`:** `[4.1.0]` contains former `[Unreleased]` content; `[Unreleased]` reset.
5. **`tied-bundle/install.json`** committed after refresh with `tied_version: "4.1.0"`.
6. `tied_validate_consistency` clean after project REQ row (if added at build).
7. Store **README** includes **Release highlights (4.1.0)** block per approved copy.

---

## Implementation phases (@build-plan)

### Phase A — Inventory

| Slug | Work |
|------|------|
| `phase-a-inventory` | `rg '4\.0\.0'` allow/deny list → `evidence/version-inventory.md` |

### Phase B — Authority bump

| Slug | Work |
|------|------|
| `phase-b-version-files` | `VERSION`, `AGENTS.md`, `README.md`, bundled docs with explicit version lines |
| `phase-b-readme-blurb` | Insert approved **Release highlights (4.1.0)** block; run `store-readme-structure.test.ts` |

### Phase C — Tests & contracts

| Slug | Work |
|------|------|
| `phase-c-tests` | `tied-methodology-version.test.ts`, `server-info.test.ts`, `server_info.response.example.json`, live envelope pins |

### Phase D — Changelog & store refresh

| Slug | Work |
|------|------|
| `phase-d-changelog` | Promote **full** `[Unreleased]` → `## [4.1.0] - 2026-11-07` (use close-out date if later) |
| `phase-d-install-witness` | `./tied-install.sh --refresh` on store root; verify `tied-bundle/install.json` `tied_version`; **include in staging map** |

### Phase E — Validation & close-out

| Slug | Work |
|------|------|
| `phase-e-validate` | Test battery; optional disposable client smoke post-refresh; CITDP persist; close-out |

---

## Non-goals

- Rewriting historical facilitator / WF trial artifacts to 4.1.0.
- Major 5.0.0 or rewriting git history.
- Bumping unrelated client clones (operators run refresh).

---

## Artifacts

- [`CITDP-REQ-TIED_METHODOLOGY_RELEASE_4_1_0.yaml`](CITDP-REQ-TIED_METHODOLOGY_RELEASE_4_1_0.yaml)
- [`test-strategy.md`](test-strategy.md)
- [`checklist-tracker.yaml`](checklist-tracker.yaml)
- [`evidence/session-handoff.md`](evidence/session-handoff.md)
