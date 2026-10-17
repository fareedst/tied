# Client DevOps integration appendix

**Audience:** Client operators wiring **PR**, **CI**, and **release** tooling around TIED-tracked work—without treating pipelines as TIED core authority.

**Traceability:** [REQ-TIED_CLIENT_DEVOPS_APPENDIX](../../tied-project/requirements/REQ-TIED_CLIENT_DEVOPS_APPENDIX.yaml) · Claude comparison [Phase 5](../../docs/comparisons/claude-code-team-code-review-vs-tied.md#7-phased-approach-to-improving-tied-recommendations-only) · feedback **`fb-mvclklsa-t5gzbo`**

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| **Client-owned** guidance for PR description fields, CI hooks, and rollback notes that **compose** with TIED proof | Merge queues, feature-flag products, or org SRE tooling as **TIED index fields** |
| Mapping PR fields to [pre-handoff verification charter](pre-handoff-verification-charter.md), [sponsor risk-tier playbook](sponsor-risk-tier-playbook.md), and [review convergence policy](review-convergence-policy.md) | Replacing **`tied_checklist_gate_validate`**, **`tied_verify`**, or MCP gate receipts |
| Optional **`client-pr-handoff-fields.v1`** template for copy-paste PR bodies | Mandatory PR-bot voters or zero-human merge policy in TIED core |
| Rollback / staged-release **documentation** on the client layer | Automatic rollback MCP or transport (Kaizen Phase 3 remains deferred) |

This Phase 5 slice is **documentation + example template**—**client-owned** configuration lives in each repo’s CI and release docs, not in methodology YAML.

---

## PR handoff fields

Use these fields in PR descriptions or handoff notes so reviewers see TIED-aligned evidence **before** diff-only rounds (compose with [review convergence policy](review-convergence-policy.md)).

| Field | Purpose | TIED compose |
| --- | --- | --- |
| **`tests_evidence`** | Commands run + pass/fail summary or manifest ref | [Pre-handoff charter](pre-handoff-verification-charter.md) executable checks |
| **`risk_tier_informative`** | Optional low / medium / high label from outreach studies | [Sponsor risk-tier playbook](sponsor-risk-tier-playbook.md) attention map—not a classifier |
| **`depth_tier`** | CITDP **`depth_tier`** for this change | Gates and integrated inquiry policy |
| **`gate_receipts`** | Paths or run ids for `pre_implementation` / `verification` when applicable | Checklist gates remain authoritative |
| **`rollback_plan`** | How to revert or disable if merge causes incident | Client release runbook; feed [incident/revert corpus](incident-revert-evaluation-corpus.md) when confirmed |
| **`req_tokens`** | `[REQ-*]` touched | Traceability for reviewer scope |

**Starter template:** [client-pr-handoff-fields.v1.example.yaml](../templates/client-pr-handoff-fields.v1.example.yaml)

---

## CI and release ownership

| Layer | Owner | TIED relationship |
| --- | --- | --- |
| **Lint / test / build jobs** | Client CI (GitHub Actions, etc.) | May invoke `lint_yaml`, project test scripts, `tied_validate_consistency`—**client** wires commands |
| **Deploy / promote** | Client release engineering | Not validated by TIED methodology indexes |
| **Feature flags / staged rollout** | Client product ops | Document in client appendix; **defer** as TIED core per [methodology composition matrix](../../docs/comparisons/methodology-composition-matrix.md) |
| **Install refresh** | `tied-install.sh` | Delivers this appendix on methodology refresh only |

TIED proves **intent and checklist evidence** during implementation; CI proves **integration** in the client environment—both are needed, neither replaces the other.

---

## Rollback and staged release

| Practice | Client DevOps note |
| --- | --- |
| **Fast rollback** | Record revert procedure in PR **`rollback_plan`**; after confirmed incident, add [evaluation-corpus](incident-revert-evaluation-corpus.md) row with **`revert`** kind |
| **Staged release** | Flags/canaries stay client-owned; link flag name in PR context when behavior is gated |
| **Stop criteria** | Align client incident thresholds with Kaizen **stop criteria** when using feedback pilot tooling—transport-linked stops **not_applicable** while Kaizen Phase 3 is deferred |

---

## Compose with Claude comparison phases 1–4

| Phase | REQ | Use in client DevOps |
| --- | --- | --- |
| 1 | [REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER](../../tied-project/requirements/REQ-TIED_PRE_HANDOFF_VERIFICATION_CHARTER.yaml) | Populate **`tests_evidence`** from charter checks |
| 2 | [REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK](../../tied-project/requirements/REQ-TIED_SPONSOR_RISK_TIER_PLAYBOOK.yaml) | Map **`risk_tier_informative`** → sponsor attention |
| 3 | [REQ-TIED_REVIEW_CONVERGENCE_POLICY](../../tied-project/requirements/REQ-TIED_REVIEW_CONVERGENCE_POLICY.yaml) | Round cap + diff-only re-review in PR workflow |
| 4 | [REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS](../../tied-project/requirements/REQ-TIED_INCIDENT_REVERT_EVAL_CORPUS.yaml) | Post-merge learning rows after rollback |

**Explicit non-adoptions** (from comparison doc): mandatory finding voter gates, zero-human merge for costly paths, PR-only workflow replacing LEAP/checklist.

---

## Operator workflow (minimal)

1. Copy [example PR fields template](../templates/client-pr-handoff-fields.v1.example.yaml) into client docs or PR template.
2. Before opening PR, run [pre-handoff charter](pre-handoff-verification-charter.md) checks; paste summarized **`tests_evidence`**.
3. Record CITDP **`depth_tier`** and playbook tier in the PR body.
4. After ship, route confirmed incidents/reverts through Phase 4 corpus guidance—not article metrics alone.
