# Fresh-Client Prompt Activation Map

**Audience:** Operators and agents working in a disposable or greenfield client created with `test-new-tied-client`  
**Scope:** What bootstrap installs, what it does *not* run, how natural-language prompts and Tracker/CITDP fields activate BBCE, Residuality, async methodology, integrated adversarial inquiry, evidence-chain profiling, Layer C pseudo-code analysis, close-out evidence, and how `.tied-yaml.yaml` shapes checklist evidence  
**Checklist source:** [`agent-req-implementation-checklist.yaml`](agent-req-implementation-checklist.yaml) (copied into every client at bootstrap)

---

## 1. Bootstrap boundary (G4 only)

### 1.1 What `test-new-tied-client` runs

From [`scripts/build-commands.sh`](../../scripts/build-commands.sh) (`make_new_tied_client` → `_new_tied_test_client`):

| Step | Output / effect |
|------|-----------------|
| `copy_files.sh` (client root = target dir) | Full TIED client bundle: `AGENTS.md`, `.cursorrules`, `.tied-yaml.yaml` (template; see §3), `./tied/` indexes + methodology refresh, `./tied/docs/agent-req-implementation-checklist.yaml`, prompt-type skills under `.cursor/skills/`, bundled **tied-yaml** skill, `templates/impl-essence-pseudocode-template.md`, client vocab handoffs under `./tied/vocab/` |
| `scripts/lint_yaml.sh -F tied` | Canonical YAML lint on `./tied/` |
| G4 onboarding audit | `working/tied-new-client-audit.v1.json` via `scripts/run-tied-new-client-audit.mjs` |
| `agent mcp enable tied-yaml` | IDE MCP registration (when `agent` CLI present) |
| `git init` + baseline commit | Single commit; message from `tools/bootstrap/lib/tied-baseline-commit-message.mjs` |

**Skip audit:** `TIED_SKIP_NEW_CLIENT_AUDIT=1` or `--skip-onboarding-audit` on `new-tied-client.mjs` harness path.

### 1.2 G4 audit proof boundary

[`scripts/lib/tied-new-client-audit.mjs`](../../scripts/lib/tied-new-client-audit.mjs):

- **Gate stage:** `G4`
- **Default checks:** Grammar v2 default audit (`runGrammarV2DefaultAudit` at G4); **`tied_validate_consistency` is off** unless `--with-consistency`
- **Proof boundary string:** *"onboarding-adherent bootstrap only; not fleet-migrated-client without G3 receipts"*
- **Report schema:** `tied-new-client-audit.v1`

This audit does **not** prove BBCE, Residuality, adversarial inquiry, evidence-chain, or per-REQ checklist completion.

### 1.3 What bootstrap does *not* create

Until a sponsor starts a **requirement-scoped** workflow (typically `plan-new-feature`, `build-plan`, or manual copy of the checklist into `working/{REQ-TOKEN}/`):

- No `working/{REQ-TOKEN}/checklist-tracker.yaml`
- No `working/{REQ-TOKEN}/adversarial-inquiry/` four-artifact bundle
- No CITDP with `risk_analysis.*` attach refs
- No Residuality worksheets under `working/.../residuality/` or `.../pilot/`
- No BBCE pilot JSON under `working/.../pilot/`
- No `working/evidence-chain/` profiles
- No Layer C reports under `working/.../pseudocode-analysis/`

**Routing after bootstrap:** Client agents read `./tied/vocab/routing.md` → dispatch to `./tied/methodology/vocab/routing.md`. Methodology glossaries copied at bootstrap include **BBCE** (`behavior-bounded-change-engineering.md`, pri 5i), **Residuality** (`residuality.md`, 5h), **async** (`async-methodology.md`, 5f), **quality assurance** (5b), **fidelity / adversarial inquiry** (5c). PRELOAD happens when checklist steps or sponsor language match those keyword rows—not at `test-new-tied-client` itself.

---

## 2. Conditional triggers (fields, slugs, evidence)

Evidence is **working-folder and CITDP attach-first** unless a separate REQ mandates blocking. Checklist text marks most BBCE/Residuality/async paths as **advisory** (W3/W4 pilots).

### 2.1 Master step → sub-procedure map

| Checklist slug | Sub-procedures / notable calls | When they run |
|----------------|--------------------------------|---------------|
| `session-bootstrap` | `sub-vocabulary-sync` (PRELOAD) | Every REQ pass; extra PRELOAD of `fidelity-research.md` + `quality-assurance.md` when work touches assurance/fidelity |
| `change-definition` | BBCE Mechanism A/D *recording* | Sponsor asks for change-locality; STDD rule B sets `bbce_advisory_enforced` |
| `impact-discovery` | `sub-residuality-analysis-pass`, `sub-shared-code-change-justification-pass`, async disposition | Profile/flag/async/BBCE preconditions (below) |
| `risk-assessment` | (depth selection) | §7 eligibility → default `depth_tier: integrated` |
| `catalog-pseudocode-contracts` | `catalog-async-boundaries` | `async_in_scope: true` |
| `flag-insufficient-specs` / related | `flag-async-contradictions` | `async_in_scope: true` |
| `gate-pseudocode-validation` | `sub-adversarial-inquiry-pass`, `sub-pseudocode-static-analysis-pass`, `sub-pseudocode-validation-pass` | After depth tier selected; Layer C before RED |
| `verification-gate` | `sub-adversarial-inquiry-pass`, `sub-evidence-chain-profile`, `sub-pseudocode-static-analysis-pass`, `sub-bbce-advisory-verification-pass`, optional CRAP report | Full suite + evidence partition |
| `traceable-commit` | `sub-adversarial-inquiry-pass`, `sub-close-out-evidence-sync`, envelope validate | Close-out; branch check via `tied gate check` (§3.5) |
| `persist-citdp-record` | `sub-evidence-chain-profile` | When profile in scope at persist time |

### 2.2 BBCE (Behavior-Bounded Change Engineering)

| Mechanism | Trigger (prompt or field) | Checklist slug | Evidence outputs |
|-----------|---------------------------|----------------|------------------|
| **A — Declared change surface** | Sponsor: *"change-locality"*, *"declared change surface"*, *"keep blast radius bounded"*, *"BBCE surface"* → Tracker `declared_change_surface` or CITDP `risk_analysis.bbce_alignment.declared_change_surface_ref` | `change-definition`, `impact-discovery` | Validated `bbce-declared-change-surface.v1`; optional locality compare (default **off**); PRELOAD `behavior-bounded-change-engineering.md` |
| **B — Shared-code justification** | Sponsor: *"shared path"*, *"shared mechanism review"* OR CITDP `shared_code_justification_ref` OR triggers from advisory pass | `impact-discovery`, `verification-gate` | `bbce-shared-code-justification.v1` under `working/{CHANGE-ID}/pilot/` |
| **C — Boundary violation report** | `slice_map_ref` + post-implementation diff paths | `impact-discovery`, `sub-bbce-advisory-verification-pass` | `bbce-boundary-violation.v1`; CITDP `boundary_violation_report_ref` |
| **D — Advisory verification bundle** | Tracker `bbce_advisory_enforced: true` at `verification-gate` | `change-definition` (default rule B), `verification-gate` | Locality events JSONL; B + C artifacts; **advisory** — no default hard block |

**STDD Rule B (Tracker `bbce_advisory_enforced`):**

- Default **`true`**: new `[REQ-*]` or create/update any `[ARCH-*]` detail
- Default **`false`**: existing-REQ bug fix with no new REQ and no ARCH detail changes (set `true` manually for large diffs)

### 2.3 Residuality Theory

| Trigger | Field / profile | Sub-procedure | Evidence |
|---------|-----------------|---------------|----------|
| Assurance profile includes **`stateful-reliability`** and/or **`data-integrity-migration`** | CITDP / impact-discovery quality matrix | `sub-residuality-analysis-pass` | Worksheets / optional `stressor-residue.v1`; attach **`risk_analysis.residuality_analysis`** on CITDP only |
| Sponsor explicitly requests residuality pass | Tracker **`residuality_pass_requested: true`** | Same | Same under `working/{REQ-TOKEN}/residuality/` or `.../pilot/` |
| `depth_tier: minimal` | — | **Skipped** unless `residuality_pass_requested` |

**Prompt phrases:** *"run residuality analysis"*, *"stressor-residue pass"*, *"stateful reliability assurance"*, *"data integrity migration profile"*.

**Non-activation:** Generic *"make it reliable"* without selecting assurance profiles or the sponsor flag does not call the sub-procedure.

### 2.4 Async methodology

| Trigger | Field | Steps | Evidence |
|---------|-------|-------|----------|
| Sponsor or in-scope IMPL mentions **AWAIT**, **Promise OUTPUT**, **Async** in EFFECTS, **SEND**, open wait, async contract rows | Tracker **`async_in_scope: true`** + `async_matched_semantic_classes` | `impact-discovery` sets flag; `catalog-pseudocode-contracts`, `flag-async-contradictions` | Closed async catalog table; contradiction findings → `resolve-pseudocode` |
| Same + `depth_tier: integrated` | — | `gate-pseudocode-validation` (W2 text) | Documents four bounded async adversarial **cases** at pre_implementation — **does not** run MCP inquiry by itself |
| `async_in_scope` alone | — | — | **Never** authorizes `tied_adversarial_inquiry_run` |

**Prompt phrases:** *"async/await"*, *"Promise"*, *"event listener IPC"*, *"retry without idempotency"*, *"timeout and cancellation"*.

### 2.5 Adversarial inquiry (integrated activation)

**Depth selection** (`risk-assessment`, [`integrated-activation-checklist-enforcement-plan.md`](../../docs/integrated-activation-checklist-enforcement-plan.md) §7):

| Work class | Default `depth_tier` | Integrated pairing required? |
|------------|----------------------|----------------------------|
| External input, auth, network, persistence, strict close-out | **`integrated`** | Yes (receipt + four artifacts per gated phase) |
| New client feature, behavior-changing | **`minimal`** unless triggers match | Only if integrated selected |
| Read-only local CLI, no secrets/network | **`minimal`** with rationale | No |

**Eligibility prompt cues:** user-uploaded files, authentication, network calls, database/persistence, *"strict close-out"*, production secrets.

**Sub-procedure:** `sub-adversarial-inquiry-pass` → when `profile_depth` / depth ≥ integrated, **`tied_adversarial_inquiry_run`** with explicit `phase` (`pre_implementation` | `verification` | `close_out`).

**Bounded artifacts only** under `working/{REQ-TOKEN}/adversarial-inquiry/` (or phase subdirs per pilot template):

1. `obligation-report.json`
2. `finding-ledger.jsonl`
3. `gate-result.json`
4. `evidence-provenance.json`

**Integrated activation is not satisfied by:** checklist step completion alone, token presence, CITDP counterexamples at `minimal`, or MCP registration without metrics + four files.

**Phases:** `gate-pseudocode-validation` (pre_implementation, blocking false), `verification-gate`, `traceable-commit` (close_out) — each integrated phase needs a **distinct** `run_id` (verification receipt cannot stand in for close_out `activation`).

### 2.6 Evidence chain profile

| Trigger | Sub-procedure | Output |
|---------|---------------|--------|
| CITDP / impact-discovery declares evidence chain in scope; quality matrix commands run | `sub-evidence-chain-profile` | `working/evidence-chain/verification-evidence-manifest.v1.json`, profile via `evidence_chain_profile_generate`; optional CITDP `evidence.profile_reference` |
| `verification-gate` | Same | Manifest outputs attached via `manifest_reference` — not "run lint separately" |

**Distinction:** CITDP **`profile_depth`** (evidence chain: `integrated` | `human_research`) ≠ **`depth_tier`** (adversarial inquiry).

### 2.7 Layer C pseudo-code static analysis

| Trigger | Sub-procedure | Output |
|---------|---------------|--------|
| Changed in-scope Active IMPL in Tracker **`impl_inventory`** | `sub-pseudocode-static-analysis-pass` | `working/{REQ-TOKEN}/pseudocode-analysis/{IMPL-TOKEN}.v1.json` with `gate_mode_applied: true` |
| `gate-pseudocode-validation` | Mandatory before RED | Pre-RED gate |
| `verification-gate` | Re-run if **`input_identity.hash`** changed vs pre-RED report | Cite existing path if unchanged |

**Prompt cues:** Any prompt that drives IMPL sidecar edits for the REQ (plan/build implementing pseudo-code) triggers Layer C when inventory lists those IMPLs—not keywords alone.

### 2.8 Close-out evidence sync

| Trigger | Sub-procedure | Output |
|---------|---------------|--------|
| `traceable-commit` | `sub-close-out-evidence-sync` | Disposition sync, verification manifest, `request-evidence-envelope.v1.json`, `tied_adherence_reconcile_run` |
| Integrated depth | Envelope **`fail_on_error_gaps`** also blocks process-adherence **warn** gaps | Stricter close-out |

### 2.9 Jev plan-skills (optional)

| Trigger | Effect | Proof boundary |
|---------|--------|----------------|
| Explicit invoke of `plan-new-feature`, `refine-plan`, `build-plan`, or `plan-close-out` **and** (`jev.plan_skills: true` in `.tied-yaml.yaml` or `TIED_JEV_PLAN_SKILLS=1`/`true` in MCP/CLI env) **and** trimmed `JEV_API_KEY` | After keyword PRELOAD, skills may call `tied_jev_status` / `tied_jev_vocab_shadow` (optional per-call `shadow_mode: tiebreak` for display-only tiebreak) and, on **build-plan** only after pre_implementation gate, `tied_jev_adversarial_triage_pilot`; CLI parity via `tied-cli.sh`; optional evidence at `working/{REQ\|PLAN-TOKEN}/jev/plan-skills/{run_id}/` when `record_evidence: true` and a valid working token | **Default off** at bootstrap; tiebreak never overrides PRELOAD; Jev shadow/triage artifacts **never** satisfy §2.5 integrated adversarial inquiry activation or replace checklist gate receipts |

---

## 3. `.tied-yaml.yaml` settings that affect checklist evidence

Bootstrap copies [`templates/.tied-yaml.yaml`](../../templates/.tied-yaml.yaml) (`scalar_style: unwrapped`, **`jev.plan_skills: false`**). File lives at **client project root** (parent of `TIED_BASE_PATH` / `./tied/`). Existing file is **never overwritten** by `copy_files.sh`.

To enable Jev plan-skills adjunct in a client: set **`jev.plan_skills: true`** in `.tied-yaml.yaml` (strict boolean) **or** `TIED_JEV_PLAN_SKILLS=1` / `true` on the MCP/CLI process; add trimmed **`JEV_API_KEY`** to the environment (never commit the key). See §2.9.

### 3.1 `scalar_style: wrapped | unwrapped`

- Governs **tied-yaml-canonical-v1** profile for `lint_yaml` / MCP format paths ([PROC-YAML_EDIT_LOOP])
- Checklist records **`styling_status`**, **`scalar_style`**, **`style_source`** at `verification-gate` and `traceable-commit` when styling is configured or non-default
- Default when absent: **`unwrapped`** (formatter-only config still defaults scalar style per server tests)

### 3.2 `client_formatter`

- Optional post-canonical hook via **`sub-client-yaml-styling`** (invoked from **`sub-yaml-edit-loop`**)
- When set: pre/post snapshot + **`yaml_semantic_compare`** required; evidence includes formatter command/version
- When absent: `styling_status: not_configured`; baseline canonical + resolved `scalar_style` only
- **Never** applies to `./tied/methodology/**`

### 3.3 `jev.plan_skills`

- Bootstrap template sets **`jev.plan_skills: false`** (opt-in).
- Only **`true`** enables plan-skill MCP tools; missing key, `false`, or invalid values stay off ([decision-copilot.md](../vocab/decision-copilot.md)).
- Independent from **`jev.agentstream_harness`** (W5 live harness).

### 3.4 `dae.crap_threshold` and CITDP `crap_block`

- **Opt-in report:** CITDP must set **`diff_scoped_crap: true`** and quality manifest collection must succeed
- Threshold: CITDP **`crap_threshold`** overrides repo **`dae.crap_threshold`**
- Output: `working/{REQ}/evidence/diff-scoped-crap-{timestamp}.json`
- **`crap_block: true`** + threshold exceeded → **blocks** at `verification-gate`; at `traceable-commit` with `crap_block: false` → **warn in commit body only**

### 3.4 `dae.express_lane_charter`

- Permits CITDP **`express_lane: true`** only when **`size: XS`** and charter allows (in CITDP or repo config)
- Affects **DAE sizing ceremony**, not BBCE/Residuality artifacts directly
- Security/billing/auth paths must **not** default express lane (checklist `change-definition`)

### 3.5 `dae.branch_check: false`

- Opts out of branch hygiene in **`tied gate check --check-branch`** / MCP gate tooling ([`client-development-index.md`](client-development-index.md))
- Alternative opt-out: CITDP **`branch_check: skip`**
- When enabled (default): mismatch between git HEAD and CITDP `branch:` or Tracker `execution_evidence.branch` → gate exit **1**

### 3.6 Related DAE / agentstream (not checklist artifact roots)

- `dae.agentstream_gate_check` / env **`AGENTSTREAM_DAE_GATE_CHECK`**: agentstream preflight; bypass flags documented in `@tied/agentstream` README — separate from per-REQ working-folder evidence

---

## 4. Prompt recipes (copyable patterns)

Each recipe assumes: fresh client bootstrapped, MCP **`tied_config_get_base_path`** → intended `./tied/`, per-request checklist copy under `working/{REQ-TOKEN}/`, and a driver skill (`plan-new-feature` → `build-plan`, etc.).

### Recipe A — Minimal doc-only REQ (no BBCE / no integrated inquiry)

**Prompt:** *"Add REQ-FOO: update README only; no auth, network, or persistence; depth minimal."*

**Expect:**

- `change-definition` → `impact-discovery` with `async_in_scope: false`, default assurance baseline
- `risk-assessment`: `depth_tier: minimal` (no §7 triggers)
- `sub-adversarial-inquiry-pass` at pre_implementation may run structurally but **no** integrated pairing requirement
- **No** `working/.../adversarial-inquiry/` four-file bundle required for gate at integrated standard
- **No** Residuality unless profiles/flag set
- **`bbce_advisory_enforced`**: true if new REQ (Rule B) but bundle only runs at verification if flag true **and** surface/slice_map satisfied

### Recipe B — BBCE declared surface + advisory verification

**Prompt:** *"Implement REQ-BAR with BBCE declared change surface: behavior X, owning slice REQ-BAR, paths `src/foo/**`, public boundary API Y; run advisory locality review at verification."*

**Expect:**

- Tracker/CITDP: `declared_change_surface` or `declared_change_surface_ref`
- PRELOAD BBCE glossary; validate v1 schema at impact-discovery
- At verification with `bbce_advisory_enforced: true`: **`sub-bbce-advisory-verification-pass`** → pilot folder artifacts, CITDP `bbce_alignment` refs
- **Caveat:** Locality compare default **off**; advisory does not block CI by default

### Recipe C — Residuality discovery

**Prompt:** *"Plan REQ-STORE with data-integrity-migration assurance profile; run residuality stressor pass before authoring REQ."*

**Expect:**

- `impact-discovery`: assurance profile triggers **`sub-residuality-analysis-pass`**
- Files under `working/{REQ-TOKEN}/residuality/` or `.../pilot/`
- CITDP **`risk_analysis.residuality_analysis`** attach refs only — **no** auto project YAML writes

**Alternate prompt:** *"Set residuality_pass_requested on the tracker even for minimal depth."* → forces pass despite minimal tier.

### Recipe D — Async + catalog (not inquiry)

**Prompt:** *"REQ-ASYNC: add AWAIT on external API with timeout and retry; document async boundaries in IMPL."*

**Expect:**

- `async_in_scope: true`, PRELOAD `async-methodology.md`
- Closed catalog at `catalog-pseudocode-contracts`; `flag-async-contradictions` before RED
- **Does not** activate integrated adversarial inquiry unless depth tier + MCP run

### Recipe E — Integrated adversarial inquiry (full evidence)

**Prompt:** *"Build REQ-AUTH: OAuth login, external IdP network calls, persist sessions; use integrated adversarial depth and run inquiry at pre_implementation, verification, and close_out with distinct run IDs."*

**Expect:**

- `risk-assessment`: `depth_tier: integrated` (§7 triggers)
- `tied_adversarial_inquiry_run` × phases → four artifacts + receipt pairing
- `tied_checklist_gate_validate` with activation payload per phase
- Optional async case **documentation** at pre_implementation if also `async_in_scope`
- Close-out: new close_out run **or** documented close-out inquiry waiver

### Recipe F — Evidence chain + verification gate

**Prompt:** *"Feature REQ-METRICS: generate evidence chain profile at verification; attach manifest references to the profile."*

**Expect:**

- Quality matrix + manifest collection
- **`sub-evidence-chain-profile`** at `verification-gate` → `working/evidence-chain/`
- Fidelity matrix executable partition cites **`evidence-provenance.json`** command provenance

### Recipe G — Layer C before tests

**Prompt:** *"Implement REQ-IMPL per checklist: complete token-commented pseudo-code and pass Layer C gate_mode before any unit tests."*

**Expect:**

- `gate-pseudocode-validation`: **`sub-pseudocode-static-analysis-pass`** reports under `working/{REQ-TOKEN}/pseudocode-analysis/`
- RED tests only after pre-RED structural gates pass

### Recipe H — CRAP diff-scoped risk (opt-in)

**Prompt (CITDP authoring):** *"Enable diff_scoped_crap with crap_block true; threshold from .tied-yaml.yaml dae.crap_threshold."*

**Repo config example:**

```yaml
dae:
  crap_threshold: 30
```

**Expect:** Report JSON under `working/{REQ}/evidence/` at verification; blocking only when `crap_block: true` and threshold exceeded.

---

## 5. Non-activation caveats (common false positives)

| Observation | Why it is *not* activation evidence |
|-------------|-------------------------------------|
| `test-new-client-audit.v1.json` ok | G4 grammar/bootstrap only |
| Methodology glossary files present | PRELOAD material; no working-folder pass output |
| Checklist YAML installed | Template until a REQ workflow runs |
| `async_in_scope: true` on Tracker | Catalog/contradiction only; not inquiry |
| CITDP counterexamples at `minimal` | Valid minimal path; not integrated pairing |
| `bbce_advisory_enforced: true` without surface/slice_map/diff | Advisory pass preconditions unmet — bundle skipped or partial |
| Running `lint_yaml` / `tied_validate_consistency` alone | Not evidence-chain profile or inquiry artifacts |
| Token `[REQ-TIED_ADVERSARIAL_INQUIRY]` in methodology merge view | Inherited read-only REQ; feature activation needs metrics + four artifacts |

---

## 6. Quick reference — sponsor language → first checklist hook

| Sponsor language (examples) | First hook slug | Key field / sub-procedure |
|-----------------------------|-----------------|---------------------------|
| BBCE / change locality / blast radius | `change-definition` | `declared_change_surface` |
| Shared library path touched | `verification-gate` | `sub-shared-code-change-justification-pass` |
| Residuality / stressors / residues | `impact-discovery` | `sub-residuality-analysis-pass` |
| async / await / Promise / IPC | `impact-discovery` | `async_in_scope` |
| login / OAuth / API / database | `risk-assessment` | `depth_tier: integrated` |
| evidence chain / manifest profile | `verification-gate` | `sub-evidence-chain-profile` |
| pseudo-code analyze / Layer C | `gate-pseudocode-validation` | `sub-pseudocode-static-analysis-pass` |
| close-out envelope / dispositions | `traceable-commit` | `sub-close-out-evidence-sync` |

---

**Related:** [`agent-req-implementation-checklist.md`](agent-req-implementation-checklist.md), [`../../docs/integrated-activation-checklist-enforcement-plan.md`](../../docs/integrated-activation-checklist-enforcement-plan.md), [`../vocab/behavior-bounded-change-engineering.md`](../vocab/behavior-bounded-change-engineering.md), [`../methodology/vocab/residuality.md`](../methodology/vocab/residuality.md) (client path: `tied/methodology/vocab/residuality.md`).

**Last updated:** 2026-09-27
