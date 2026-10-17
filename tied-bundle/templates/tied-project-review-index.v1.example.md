# tied-project/review/ — path-scoped review index (example)

**Schema:** `tied-project-review-index.v1` · **Copy to:** `tied-project/review/README.md` and edit.

Central map when adjacent **`REVIEW.md`** stubs would duplicate the same rules.

---

## Proof boundary

Client-owned index only. Not methodology YAML; not TIED core authority.

---

## Path map

| Glob / prefix | Focus | Adjacent stub | Local checks |
| --- | --- | --- | --- |
| `mcp-server/**` | MCP tool contracts, schema validation | optional `mcp-server/REVIEW.md` | `npm test` in `mcp-server/` |
| `tools/bootstrap/**` | install surfaces, factory tests | — | `node --test tools/bootstrap/lib/*.test.mjs` |
| `tied-project/**` | project TIED YAML, vocab | — | `tied_validate_consistency`, `lint_yaml` |

## Discovery

Agents: match longest prefix for the file under edit; fall back to [AGENTS.md](../../AGENTS.md) and [routing.md](../vocab/routing.md) (paths relative to `tied-project/review/`).

## Related methodology

- [Path-scoped review guidance](../../tied-bundle/docs/path-scoped-review-guidance.md)
- [Pre-handoff verification charter](../../tied-bundle/docs/pre-handoff-verification-charter.md)
