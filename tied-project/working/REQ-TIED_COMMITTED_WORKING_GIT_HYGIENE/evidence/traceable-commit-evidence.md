# traceable-commit — REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE

**VALIDATE:** vocab RECORD for committed working regenerable profile in `tied-project/vocab/tied-methodology.md`.

**Gate refs:** `closeout-run-close-out-gates-final.json`, envelope at `request-evidence-envelope.v1.json`.

**Hygiene:** `git-hygiene-receipt-2026-10-23.md` (preview only).

**Staging map (scoped):**

- `.gitignore`
- `tools/bootstrap/lib/working-gitignore.mjs`, `working-root.mjs`, `committed-working-inventory.mjs`, `committed-working-gitignore.test.mjs`, `render-install-resource-matrix.mjs`
- `tools/bootstrap/scripts/apply-store-gitignore-profile.mjs`, `inventory-committed-working-regenerable.mjs`, `migrate-tracked-committed-working-regenerable.mjs`
- `mcp-server/src/working-root.ts`, `working-root.test.ts`, `packages/agentstream/src/working-root.ts`
- `mcp-server/src/methodology-conformance-effectiveness-pairing/pairing-demo-fixture.ts`, `pairing-gate.test.ts`, `methodology-conformance-effectiveness-pairing.mcp.test.ts`
- `mcp-server/test/fixtures/methodology-pairing/`
- `tied-bundle/docs/working-artifact-placement.md`, `client-development-index.md`
- `tied-project/citdp/CITDP-REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE.yaml`, `CITDP-REQ-METHODOLOGY-CONFORMANCE-EFFECTIVENESS-PAIRING.yaml` (demo path)
- `tied-project/requirements.yaml`, `architecture-decisions.yaml`, `implementation-decisions.yaml`, `semantic-tokens.yaml` + CWGH detail files
- `tied-project/vocab/tied-methodology.md`
- `tied-project/working/REQ-TIED_COMMITTED_WORKING_GIT_HYGIENE/**`
- `tied-project/working/REQ-TIED_LAYERED_CLIENT_INSTALL/install-resource-matrix.md`
- `git diff --name-only --diff-filter=D tied-project/working` (index-only untracks for this wave)
- `CHANGELOG.md`

**Exclude:** unrelated `docs/comparisons/*`, in-flight `REQ-TIED_OPEN_ONTOLOGIES*`, stray `tied-bundle/**` reports not listed above.
