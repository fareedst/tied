# Local TIED client methodology refresh

Operator runbook for refreshing **`tied/methodology/`** and bundled skills in existing client repos using the TIED source checkout.

**Canonical guide:** [tied/docs/methodology-migration.md](../../tied/docs/methodology-migration.md)

**Script:** [scripts/refresh-tied-client.sh](../../scripts/refresh-tied-client.sh)

## Quick start

```bash
export TIED_SOURCE="/Users/fareed/Documents/dev/chatgpt/stdd"
./scripts/refresh-tied-client.sh --sync-docs /path/to/client
git -C /path/to/client config core.hooksPath .githooks   # if not set by script
```

## Flag order (copy-files.mjs)

When invoking bootstrap directly, place **methodology/hook flags before parity flags**:

```bash
node tools/bootstrap/copy-files.mjs \
  --merge-vocab --methodology-readonly --install-methodology-hook \
  --strict-refresh \
  /path/to/client
```

`copy_files.sh` may delegate to `@tied/cli` bootstrap, which does not accept all parity/hook flags; prefer `copy-files.mjs` or `refresh-tied-client.sh` for brownfield refresh.

## `--semantic-yaml-compare` caveat

Parity A uses directory-level semantic compare for root index YAML. Extra YAML under `templates/` that is not copied into `tied/methodology/` can mark indexes as drifted even when file hashes match. For strict refresh on brownfield clients, use byte/hash parity (omit `--semantic-yaml-compare`) unless template roots are aligned.

## Client registry

See [registry.yaml](./registry.yaml) for tracked local clients, rollback tags, and refresh notes.
