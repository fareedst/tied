# Hosted Git cloud — client extension appendix

**Audience:** Client operators who use a **hosted Git provider** (Bitbucket, GitHub, GitLab, or similar) for **pull requests / merge requests**, CI check runs, and release branches—and want those facts to **compose** with TIED proof **without** making the host TIED’s authority layer. The guidance is **provider-agnostic** first; vendor names are **examples**.

**Traceability:** [REQ-TIED_CLIENT_DEVOPS_APPENDIX](../../tied-project/requirements/REQ-TIED_CLIENT_DEVOPS_APPENDIX.yaml) · [Client DevOps integration appendix](client-devops-integration-appendix.md) · [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY](../../tied-project/requirements/REQ-TIED_ENVIRONMENT_VARIABLE_POLICY.yaml)

**Persante reference (one vendor stack):** Bitbucket-oriented `verify-pr` in external SDD skills — see [persante-sdd-skills-vs-tied-agent-management.md](../../docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md).

---

## Proof boundary

| In scope | Out of scope |
| --- | --- |
| **Provider-agnostic** guidance: environment **identity** for “which remote repo and branches,” optional **automation** that **reads** PR/MR metadata and check runs, mapping results to [PR handoff fields](client-devops-integration-appendix.md#pr-handoff-fields) | TIED **REQ/ARCH/IMPL** YAML as the system of record for **remote URL**, **default branch policy**, or **pipeline definitions** |
| **Compose** with [client-pr-handoff-fields.v1.example.yaml](../templates/client-pr-handoff-fields.v1.example.yaml): paste or generate **`tests_evidence`**, **`gate_receipts`**, etc. | Replacing **`tied_validate_consistency`**, **`tied_checklist_gate_validate`**, **`tied_verify`**, or checklist receipts |
| **Client-owned** credentials in env or secret store (never committed) | Mandatory **merge-queue**, **auto-deploy**, or **host-specific** MCP tools in TIED core |
| Documentation of **dev/integration** vs **prod/release** branch **names** as **conventions** the client chooses | TIED methodology **deciding** production promotions, tenancy, or blast radius |

TIED remains authoritative for **intent** (REQ → ARCH → IMPL), **pseudo-code**, and methodology **gates**; the **Git cloud** is authoritative for **what is merged**, **what CI ran**, and **what is deployed** on that host.

---

## Identity store (environment)

Use **names you control**—TIED does not require these exact variable names; they are a **portable sketch** for scripts and operator docs.

### Generic (provider-neutral)

| Variable | Purpose |
| --- | --- |
| **`TIED_GIT_CLOUD_PROVIDER`** | Short label (e.g. `bitbucket`, `github`, `gitlab`, `other`) — **informative** only |
| **`TIED_REPO_OWNER`** | Organization, workspace, user, or top-level group (host-specific meaning) |
| **`TIED_REPO_NAME`** | Repository slug **or** client-defined **single string** `owner/name` if that fits your tooling |
| **`TIED_DEV_BRANCH`** | Branch used for **integration** / feature work (client-defined; e.g. `develop`, `main`) |
| **`TIED_PROD_BRANCH`** | Branch or **tag pattern** used for **production** truth (client-defined; e.g. `production`, `release/*`) |
| **`TIED_GIT_REMOTE_NAME`** | Optional: local git remote name (e.g. `origin`) for docs that drive CLI |

**Credentials** (never commit; use your secret manager or CI secrets):

| Pattern | Purpose |
| --- | --- |
| **Host API token** | Personal/access token, OAuth token, or app password with **least privilege** (read PR/MR + read commit status only when possible) |
| **Host user or account id** | Some APIs require a username or account email **paired** with the token—see vendor docs |

Details and class names: [tied-product-configuration.md](../../tied-project/vocab/tied-product-configuration.md); policy: [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY](../../tied-project/requirements/REQ-TIED_ENVIRONMENT_VARIABLE_POLICY.yaml).

### Provider examples (mapping only)

| Provider | Typical owner key | Typical repo key | Notes |
| --- | --- | --- | --- |
| **Bitbucket Cloud** | `workspace` | `repo_slug` | REST 2.0 pullrequest + build status APIs; example automation: external `verify-pr` summarizers |
| **GitHub** | `owner` (user or org) | `repo` | REST or GraphQL for PR + check runs |
| **GitLab** | group + project path or numeric **project id** | `NAMESPACE/PROJECT` or id | Merge requests + pipeline status APIs |

Copy **[client-hosted-git-env.example.env](../templates/client-hosted-git-env.example.env)** into your repo as `.env.example` (or similar)—**placeholders only**.

---

## PR/MR verification shape (host-agnostic)

Many teams run a **verify-PR**-style step before handoff. In abstract terms it may confirm:

- The change request is **open**, targets the **expected base** branch, and is **not draft** (if your policy forbids draft handoff).
- **Merge conflicts** are absent or explicitly accepted per process.
- **Required check runs** on the head commit have **succeeded** (or your policy allows documented **waivers**).
- The **description** carries [PR handoff fields](client-devops-integration-appendix.md#pr-handoff-fields).

Map outcomes into **`client-pr-handoff-fields.v1`**:

| Verify-PR-style signal | Suggested handoff field |
| --- | --- |
| Commands you re-ran locally + exit codes | **`tests_evidence`** |
| Links or ids for checklist / gate JSON | **`gate_receipts`** |
| CITDP depth for this change | **`depth_tier`** |
| REQ tokens in scope | **`req_tokens`** |
| How to revert or disable | **`rollback_plan`** |

---

## Dev branch vs prod branch

| Lane | Typical use | TIED relationship |
| --- | --- | --- |
| **Dev / integration** (`TIED_DEV_BRANCH`) | Feature branches merge here (or into `main` first); CI runs unit/integration tests | **[PROC-TIED_DEV_CYCLE](../../tied-bundle/docs/processes.md)** evidence is produced **before** host merge; CI proves the **integrated** tree |
| **Prod / release** (`TIED_PROD_BRANCH` or tags) | Promotion, tagging, or deploy triggers per **client** release engineering | **Defer** to client ops ([tied-vs-well-known-methodologies.md](../../docs/comparisons/tied-vs-well-known-methodologies.md)); document **rollback** in **`rollback_plan`** |

TIED does **not** automate **prod** deploy or **branch protection** rules on the host.

---

## Security

- Treat API tokens like production secrets: **scoped**, **rotated**, **never** logged in CI output pasted into PRs.
- Prefer **read-only** automation that **writes** only the PR body or local summaries—not TIED project YAML.
- For full env inventory expectations, use **`tied_config_report`** where applicable ([tied-product-configuration.md](../../tied-project/vocab/tied-product-configuration.md)).

---

## Operator workflow (minimal)

1. Set **identity env** (or document it in your runbook) using [client-hosted-git-env.example.env](../templates/client-hosted-git-env.example.env) as a template.
2. Keep using [Client DevOps integration appendix](client-devops-integration-appendix.md) for **PR field** norms.
3. Run your host’s **verify** script (if any) **before** asking reviewers to spend attention; paste condensed results under **`tests_evidence`**.
4. After incidents, follow **rollback** + [incident/revert corpus](incident-revert-evaluation-corpus.md) guidance when your project adopts it.
