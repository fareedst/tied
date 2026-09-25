# Methodology client boundary — offline / air-gapped operator runbook

**Audience:** Client operators who cannot rely on network-published MCP methodology bundles.  
**Traceability:** [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY](../requirements/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY.yaml) migration gate **G4**; executable plan `working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/PLAN.md`.

Bundled MCP read (`TIED_METHODOLOGY_BUNDLE_PATH`, G2/G3) is **optional**. Offline and air-gapped cohorts **continue** to refresh inherited methodology with `./copy_files.sh` from a TIED source checkout or tarball. No bundle env var or release publish is required until the organization opts in.

---

## When to stay on `copy_files.sh` refresh

| Cohort signal | Stay on copied tree |
| --- | --- |
| No outbound network from build or agent hosts | Yes |
| Air-gapped or classified enclave | Yes |
| MCP bundle artifact not approved or not shipped internally | Yes |
| Pilot not ready; local `tied/methodology/` already matches policy | Yes |
| Org **opts in** to bundle-only reads (G2 pilot) | No — see [decision matrix](#decision-matrix-online-bundle-pilot-vs-copied-tree) |

**Non-goals:** Removing the local `tied/methodology/` tree org-wide; mandating bundle-only deployment without sponsor sign-off ([G4 receipt](../../working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/evidence/methodology-offline-policy-signoff.v1.json)).

---

## Step-by-step refresh procedure

Inherited methodology lives under **`tied/methodology/`** only. Project REQ/ARCH/IMPL and `tied/vocab/` are **not** overwritten by a methodology refresh.

### From TIED source repository

1. Obtain a TIED source tree (git clone, internal mirror, or approved tarball) at a known version tag or commit.
2. From the **source repo root** (directory containing `copy_files.sh`):

   ```bash
   ./copy_files.sh /path/to/client/project
   ```

   Optional Phase A hardening (explicit, not default-on):

   ```bash
   ./copy_files.sh --install-methodology-hook /path/to/client/project
   ./copy_files.sh --methodology-readonly --install-methodology-hook /path/to/client/project
   git -C /path/to/client/project config core.hooksPath .githooks
   ```

3. In the client project, confirm methodology indexes resolve:

   ```bash
   export TIED_BASE_PATH=/path/to/client/project/tied
   # MCP or tied-cli:
   tied_validate_consistency   # expect ok: true when project YAML is consistent
   ```

4. Run client tests as usual. Do **not** edit files under `tied/methodology/`; record client changes only in project YAML under `tied/`.

### From tarball (no git on client)

1. Unpack TIED source on a connected staging machine (or import tarball into the enclave per local policy).
2. Run `./copy_files.sh /path/to/client` from that tree as above.
3. Transfer the updated client `tied/methodology/` tree into the air-gap if your process copies artifacts rather than running bootstrap inside the enclave.

`copy_files.sh` overwrites **`tied/methodology/`** from the source manifest; client project indexes and detail files outside that tree are preserved.

---

## Coexistence with optional `TIED_METHODOLOGY_BUNDLE_PATH`

| Mode | `TIED_METHODOLOGY_BUNDLE_PATH` | Local `tied/methodology/` | Reads |
| --- | --- | --- | --- |
| **Offline default (G4)** | unset | present (refreshed via `copy_files.sh`) | Disk tree (methodology-first, then project) |
| **Bundle pilot (G2)** | set to corpus dir | may be omitted on disk | Bundle + project fallback |
| **Rollback (G5)** | unset after pilot | refresh with `copy_files.sh` | Disk tree restored |

**Rollback:** Unset `TIED_METHODOLOGY_BUNDLE_PATH`, re-run `./copy_files.sh` from TIED source, restart MCP/`tied-cli`. See [mcp-server/methodology-bundle/README.md](../../mcp-server/methodology-bundle/README.md).

---

## Phase A hooks and CI guard

Mechanical enforcement composes with MCP project-only write guards — hooks do **not** replace `detail-loader` / `yaml-loader` rejection.

| Mechanism | Where documented |
| --- | --- |
| Pre-commit hook template | [client-development-index.md](client-development-index.md) — bootstrap `--install-methodology-hook` |
| CI path guard (advisory / block) | Same doc — **methodology-boundary-ci-guard** |
| Hook template source | `tools/bootstrap/templates/pre-commit-methodology-guard.sh` |

Policy anchor: `[PROC-TIED_METHODOLOGY_READONLY]` in [processes.md](processes.md).

---

## Decision matrix: online bundle pilot vs copied tree

| Factor | Copied tree (`copy_files.sh`) | Bundle pilot (`TIED_METHODOLOGY_BUNDLE_PATH`) |
| --- | --- | --- |
| Network | None required for refresh | Need corpus + manifest beside `@tied/mcp` (G3 pack) |
| Pinning | Source tag/commit at refresh time | `methodology-bundle-manifest.v1.json` + `@tied/mcp` version |
| Disk footprint | Full `tied/methodology/` on client | Optional omit local tree (G2) |
| Sponsor gate | **G4** offline policy sign-off | G2 parity + G3 release pack |
| Writes | Project-only (unchanged) | Project-only (unchanged) |

Organizations **may** run both: copied tree as baseline, bundle env for a pilot subset. Do not remove the copied tree program-wide until migration gates G1–G4 are met and documented on the [methodology PLAN](../../working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/PLAN.md).

---

## G3 pack (orgs that can ship corpus beside `@tied/mcp`)

When network publish is available:

1. `cd mcp-server && npm run build && npm run methodology-bundle:pack`
2. Ship `methodology-bundle/corpus/` + `methodology-bundle-manifest.v1.json` with the MCP release.
3. Pilot clients: `export TIED_METHODOLOGY_BUNDLE_PATH=/path/to/corpus`

Details: [mcp-server/methodology-bundle/README.md](../../mcp-server/methodology-bundle/README.md).

---

## Related evidence

| Artifact | Path |
| --- | --- |
| G4 sponsor sign-off (example) | `working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/evidence/methodology-offline-policy-signoff.v1.json` |
| Migration gates | `working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/PLAN.md` |
| G4 slice evidence | `working/REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY/evidence/g4-sponsor-signoff-2026-09-25.md` |
