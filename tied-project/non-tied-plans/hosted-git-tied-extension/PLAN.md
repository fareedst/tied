# Plan: Hosted Git cloud — TIED client extension (docs + env)

**Slug:** `hosted-git-tied-extension`  
**Track:** non-tied-plan → **non-tied-refine** (this revision) → `@non-tied-build` → optional `@non-tied-close`

**Canonical build spec:** [hosted Git extension plan (workspace)](file:///Users/fareed/.cursor/plans/bitbucket_tied_client_extension_38618d9f.plan.md) — same content as below; this folder is the **linked** `tied-project/non-tied-plans/{slug}/` handoff.

---

## Refined sponsor constraints (locked)

| Constraint | Value |
| --- | --- |
| **Scope** | **Documentation + templates only** — no MCP, no `tied-cli` product changes, **no** new REQ/ARCH/IMPL |
| **Framing** | **Provider-generic** — **hosted Git** / **Git cloud provider** / **merge request (MR) or pull request (PR)** APIs; **Bitbucket**, **GitHub**, **GitLab** are **examples** only |
| **“Store”** | **Environment variables** (optional `client-hosted-git-env.example.env`) — not TIED YAML as system of record for remotes |
| **`tied-install`** | New files live under **`tied-bundle/docs/`** and **`tied-bundle/templates/`** so clients inherit on refresh |

---

## RESOLVE (Touchpoint 1)

PRELOAD per [tied-project/vocab/routing.md](../../vocab/routing.md): [tied-methodology.md](../../vocab/tied-methodology.md), [tied-product-configuration.md](../../vocab/tied-product-configuration.md) (env, `REQ-TIED_ENVIRONMENT_VARIABLE_POLICY`). **Non-tied track:** no **RECORD** pass for new glossary terms unless sponsor asks ([non-tied-boundary.md](../../../tools/bundled-prompt-type-skills/prompt-shared/non-tied-boundary.md)); existing vocabulary covers **client-owned** CI/CD.

| Sponsor term | Resolved meaning |
| --- | --- |
| **Git cloud archive** | **Hosted remote** for Git + **PR/MR** + CI metadata; **not** a second semantic DB for TIED tokens |
| **Extension** | Optional **client appendix** that **composes** with [client-devops-integration-appendix.md](../../../tied-bundle/docs/client-devops-integration-appendix.md) · [REQ-TIED_CLIENT_DEVOPS_APPENDIX](../../requirements/REQ-TIED_CLIENT_DEVOPS_APPENDIX.yaml) |
| **Dev / prod branches** | **Client-named** long-lived branches (e.g. integration vs release); documented as **`TIED_DEV_BRANCH`** / **`TIED_PROD_BRANCH`** (or equivalent), not prescribed |
| **verify-pr-style check** | Read-only automation: PR/MR open, base, check runs, conflicts — **host-agnostic** description; Persante+Bitbucket is **one** reference implementation |

---

## Deliverables (build targets)

| Artifact | Path |
| --- | --- |
| Appendix | [tied-bundle/docs/client-hosted-git-extension-appendix.md](../../../tied-bundle/docs/client-hosted-git-extension-appendix.md) |
| Env example | [tied-bundle/templates/client-hosted-git-env.example.env](../../../tied-bundle/templates/client-hosted-git-env.example.env) |
| Index row | [tied-bundle/docs/client-development-index.md](../../../tied-bundle/docs/client-development-index.md) Quick read |
| DevOps cross-link | [tied-bundle/docs/client-devops-integration-appendix.md](../../../tied-bundle/docs/client-devops-integration-appendix.md) — short “Hosted Git cloud extensions” paragraph |
| Persante comparison tweak | [docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md](../../../docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md) — pointer to generic appendix; Bitbucket as example |
| Test extension | [tools/bootstrap/lib/client-devops-integration-appendix-doc.test.mjs](../../../tools/bootstrap/lib/client-devops-integration-appendix-doc.test.mjs) — second `describe` for new appendix markers |

---

## Appendix outline (`client-hosted-git-extension-appendix.md`)

1. Metadata (purpose, audience, **REQ-TIED_CLIENT_DEVOPS_APPENDIX** trace line, status analysis-only).
2. **Proof boundary** (in/out) — match tone of client DevOps appendix.
3. **Generic env identity** — `TIED_GIT_CLOUD_PROVIDER` or `GIT_CLOUD_PROVIDER`, `TIED_REPO_OWNER`, `TIED_REPO_NAME`, optional `TIED_DEV_BRANCH`, `TIED_PROD_BRANCH`; credential variables named generically + **provider examples** table (Bitbucket/GitHub/GitLab column notes).
4. **Compose with PR handoff** — map verify-pr-style facts → [client-pr-handoff-fields.v1.example.yaml](../../../tied-bundle/templates/client-pr-handoff-fields.v1.example.yaml) fields.
5. **Branch workflow** — integration vs prod path; **no** TIED merge/deploy authority.
6. **Security** — [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY](../../requirements/REQ-TIED_ENVIRONMENT_VARIABLE_POLICY.yaml), [tied-product-configuration.md](../../vocab/tied-product-configuration.md).

---

## Handoff

- **`@non-tied-build` status:** Delivered appendix, env template, cross-links (index, DevOps appendix, Persante comparison), extended [client-devops-integration-appendix-doc.test.mjs](../../../tools/bootstrap/lib/client-devops-integration-appendix-doc.test.mjs). `node tools/bootstrap/lib/client-devops-integration-appendix-doc.test.mjs` passes.
- **Next:** `@non-tied-close` optional — walk [test-strategy.md](test-strategy.md) checkboxes.
- **Forbidden on this track:** project TIED index/detail YAML edits; IMPL sidecars; automatic git push.
