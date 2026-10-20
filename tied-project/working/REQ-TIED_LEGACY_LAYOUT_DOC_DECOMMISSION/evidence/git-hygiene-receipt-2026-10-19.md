# git-hygiene receipt — REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION

**Date:** 2026-10-19  
**Tool:** `tied_git_hygiene` (`context_mode: plan_close_out`, preview only)

## Scope

Staged only the legacy layout documentation decommission wave (52 paths); no unrelated fixture drift in working tree at commit time.

## Excluded (gitignore / policy)

- `tied-project/working/REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION/evidence/request-evidence-envelope.v1.json` (gitignored)
- `tied-project/working/REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION/evidence/not-applicable-receipt.v1.json` (gitignored)
- `tied-project/working/REQ-TIED_LEGACY_LAYOUT_DOC_DECOMMISSION/evidence/verification-evidence-manifest.v1.json` (local regenerate via close-out runner; not required in git for this wave)

## Traceable commit

**`28fee75a3ea33ca7a75f4097dd17a93c1dbe69bf`** — `docs(tied): decommission legacy tied/ layout operator prose`
