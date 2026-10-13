# Operating environment externalities (canonical)

**Scope:** Vocabulary for managing **application externalities** and **complexity in the operating environment**—external workflows, consumer dependencies, and undocumented behavioral contracts—when TIED delivery must preserve, migrate, or retire behavior outside the repository. **Normative workflow:** [`../../docs/tied-operating-environment-externalities.md`](../../docs/tied-operating-environment-externalities.md).

**Traceability:** (proposed) `[REQ-TIED_OPERATING_ENVIRONMENT_EXTERNALITIES]` · composes with `[PROC-BROWNFIELD_INTENT_ELEVATION]`, `[REQ-TIED_FIDELITY_RESEARCH]`, BBCE glossary, residuality glossary.

**Status:** Draft glossary (v0) — VALIDATE on edit per `[PROC-VOCABULARY_INDEX]`.

**See also:** [`routing.md`](routing.md) (row **2e**) · [`behavior-bounded-change-engineering.md`](behavior-bounded-change-engineering.md) · [`residuality.md`](residuality.md) · [`fidelity-research.md`](fidelity-research.md) · [`quality-assurance.md`](quality-assurance.md) · [`sponsor-agent-relationship.md`](sponsor-agent-relationship.md) · [`../../docs/tied-concept-impact-inquiry.md`](../../docs/tied-concept-impact-inquiry.md)

---

## Preferred terms vs synonyms

| Preferred | Avoid | Notes |
| --- | --- | --- |
| **operating environment externalities (OEE)** | externalities (alone), ops complexity (vague) | Additional specification level when §2 activation criteria in the OEE spec apply |
| **operating environment** | production (alone), infra (alone) | Peers, humans, networks, clocks, habits, runbooks—not only cloud resources |
| **external workflow** | user flow (UI-only), integration (alone) | End-to-end procedure **outside** the repo that uses public behavioral boundaries |
| **external workflow register** | workflow doc, runbook dump | Committed artifact listing workflows, evidence, disposition, compatibility |
| **compatibility ledger** | breaking change list (alone) | Stance per workflow/boundary: preserve / migrate / break / unknown |
| **compatibility stance** | backward compatible (vague) | Explicit sponsor-owned decision with owner and expiry when bounded |
| **observed dependency** | current behavior (alone) | What evidence shows today—not approved obligation |
| **approved obligation** | implied requirement | Promoted via brownfield / REQ after `approved` disposition |
| **public behavioral boundary** | API (narrow) | Same term as BBCE: HTTP, CLI, message, job, file drop, webhook |
| **consumer** | user (alone) | Any external actor depending on observable effects (team, partner, batch job) |
| **environmental stress** | edge case (alone) | Retries, duplicates, partial failure, skew—often residuality **stressors** |
| **operational feedback** | anecdote | Append-only post-ship themes; not LEAP until confirmed |

## Critical contrasts (do not conflate)

| OEE term | Other term | Distinction |
| --- | --- | --- |
| **external workflow** | **behavioral slice** (BBCE) | Workflow = operator/integration procedure; slice = change-ownership unit in repo traceability |
| **observed dependency** | **REQ satisfaction** | Observed ≠ must keep until `approved` + tests |
| **compatibility stance `preserve`** | **unchanged behavior** (CITDP) | Preserve targets external workflow evidence; CITDP unchanged behavior is change-scoped intent |
| **OEE** | **concept impact inquiry** | Inquiry = business concept economics; OEE = operating-environment dependency management |
| **operational feedback** | **fidelity finding** | Feedback is raw ops input; findings follow fidelity lifecycle and proof boundary |
| **environmental stress** | **residual risk** | Stress = conditions applied; residual risk = remaining exposure after controls |

## Naming bridge

| Concept | Artifact / hook | Notes |
| --- | --- | --- |
| OEE working folder | `tied-project/working/OEE-{SLUG}/` | Committed; see OEE spec §9 |
| Reference pilot | `tied-project/working/OEE-TIED-CLIENT-DELIVERY/` | STDD supplier→client workflows; copy template |
| Register | `external-workflow-register.md` | Primary inventory |
| Ledger | `compatibility-ledger.md` | Stances and waivers |
| Tracker hook (proposed) | `operating_environment_externalities` | Links register + ledger refs |
| Disposition | `observed` / `approved` / `unresolved` / `rejected` | Aligns with brownfield matrix |
| Stance | `preserve` / `migrate` / `break` / `unknown` | Separate from disposition |

## Authority boundary

1. OEE **surfaces and constrains** external dependencies; it does not replace REQ/ARCH/IMPL.
2. Only **`approved`** rows promote to requirements; **`preserve`** without approval is a **costly choice** warning, not intent.
3. Registers and ledgers are **evidence** until CITDP and gates enroll the change.
4. Green in-app tests do **not** imply external workflow satisfaction ([proof boundary](quality-assurance.md)).

## Alphabetical index

| Term | Section |
| --- | --- |
| approved obligation | Preferred terms vs synonyms |
| compatibility ledger | Preferred terms vs synonyms |
| compatibility stance | Preferred terms vs synonyms |
| consumer | Preferred terms vs synonyms |
| environmental stress | Preferred terms vs synonyms |
| external workflow | Preferred terms vs synonyms |
| external workflow register | Preferred terms vs synonyms |
| observed dependency | Preferred terms vs synonyms |
| operating environment | Preferred terms vs synonyms |
| operating environment externalities (OEE) | Preferred terms vs synonyms |
| operational feedback | Preferred terms vs synonyms |
| public behavioral boundary | Preferred terms vs synonyms |
