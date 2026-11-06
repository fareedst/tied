# Test strategy — hosted Git client extension (non-tied)

Manual checks before `@non-tied-close`.

## Docs exist and are linked

- [x] [client-hosted-git-extension-appendix.md](../../../tied-bundle/docs/client-hosted-git-extension-appendix.md) exists after build
- [x] [client-development-index.md](../../../tied-bundle/docs/client-development-index.md) Quick read links it with **generic** label (not Bitbucket-only)
- [x] [client-devops-integration-appendix.md](../../../tied-bundle/docs/client-devops-integration-appendix.md) links to the new appendix
- [x] [persante-sdd-skills-vs-tied-agent-management.md](../../../docs/comparisons/persante-sdd-skills-vs-tied-agent-management.md) references generic appendix; Bitbucket remains **example** where mentioned

## Content quality

- [x] Title and lead sections use **hosted Git / Git cloud** framing; Bitbucket/GitHub/GitLab only in examples or tables
- [x] **Proof boundary** states API/PR checks are **optional client glue**; TIED core authority unchanged
- [x] Env template has **no secrets**; placeholders only
- [x] [REQ-TIED_CLIENT_DEVOPS_APPENDIX](../../requirements/REQ-TIED_CLIENT_DEVOPS_APPENDIX.yaml) cited as compose parent; **no** new REQ minted

## Automated test

- [x] `node tools/bootstrap/lib/client-devops-integration-appendix-doc.test.mjs` passes (includes new appendix markers)

## Non-tied boundary

- [ ] No edits to `tied-project/requirements/*.yaml` detail content beyond incidental if any (prefer **none**); no new tokens

## Security

- [ ] No real tokens, app passwords, or PAT strings in repo files
