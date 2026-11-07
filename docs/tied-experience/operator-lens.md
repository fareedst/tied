# Operator lens

**Audience:** Engineers and integrators who deliver TIED from the **store checkout** to a **client** or **primary implementation repository**.

Canonical quick start also lives in [README.md](../../README.md#quick-start-macos); this page adds topology and routing context.

---

## Configuration rhythm (store → client)

Same spine as [README — Primary operator delivery path](../../README.md#primary-operator-delivery-path): store clone → workspace build → client install → MCP confirm.

| Step | Goal | Command |
| --- | --- | --- |
| 1 | Clone TIED store | `git clone https://github.com/fareedst/tied` |
| 2 | Build MCP / CLI / bootstrap (`mcp-server/dist/index.js`, `tied`, `tied agentstream`) | `./build-workspace.sh` |
| 3 | Install into client directory | `./tied-install.sh /path/to/client` |
| 4 | Confirm writable root | [Manually accept MCP](../../README.md#manual-mcp-acceptance) in Cursor or Claude CLI, then **`tied_config_get_base_path`** → `tied-project/` |

**Copy-paste spine** (replace `/path/to/client`; run from store root after clone):

```bash
git clone https://github.com/fareedst/tied
cd tied
./build-workspace.sh
./tied-install.sh /path/to/client
```

| When you need… | Command |
| --- | --- |
| Build script help | `./build-workspace.sh --help` |
| Install script help (no args = styled help) | `./tied-install.sh --help` |
| Methodology refresh on an existing client | `./tied-install.sh --refresh /path/to/client` |
| Primary implementation repo | [Greenfield routing](#greenfield-routing) → primary row, or [README primary implementation](../../README.md#primary-implementation-repository) |

Windows: [README Install and use](../../README.md#install-and-use).

![Store and primary linked install](assets/store-client-topology.svg)

---

## Greenfield routing

| Situation | Command (from store root) | Next step |
| --- | --- | --- |
| Disposable smoke client | `source scripts/build-commands.sh && test-new-tied-client` | Open client in Cursor; enable MCP |
| External client directory | `./tied-install.sh /path/to/your/project` | [Getting started with a new client project](../../README.md#getting-started-with-a-new-client-project) |
| Primary implementation repo | `./tied-install.sh /path/to/primary` | [Primary implementation repository](../../README.md#primary-implementation-repository) |

After bootstrap: confirm MCP base path, then [Compact feature rhythm](../../README.md#compact-feature-rhythm).

**Store-as-primary note:** This git repository is both store and TIED client. To install into **other** primaries, keep a **separate store clone** and run install from that checkout ([tools/bootstrap/README.md](../../tools/bootstrap/README.md)).

---

## Brownfield routing (not EDPC depth)

| Situation | Start here |
| --- | --- |
| Methodology refresh | [methodology-migration.md](../../tied-bundle/docs/methodology-migration.md) and `./tied-install.sh --refresh /path/to/client` (from store root) |
| Architecture recovery | [EASAR](../methodologies/evidence-assured-software-architecture-recovery.md) |
| External workflows | [Operating environment externalities](../tied-operating-environment-externalities.md) |

Full EDPC choreography: [Engineer lens — brownfield comprehension](engineer-agent-lens.md#brownfield-comprehension).

Bootstrap details: [tools/bootstrap/README.md](../../tools/bootstrap/README.md) · `how install-matrix` after `source scripts/build-commands.sh`.

---

## Certifiability tooling (operator smoke)

Read-only MCP/CLI layer for `[REQ-TIED_PROCESS_CERTIFICATION_READINESS]`: `tied certification spec-validate`, `conformance-evaluate`, `capability-evaluate`, and related commands — see [Sponsor lens](sponsor-lens.md) for what readiness does **not** claim.

Harness invocation and workspace setup: [Engineer lens — certifiability readiness tooling](engineer-agent-lens.md#certifiability-readiness-tooling) and [mcp-server/README.md](../../mcp-server/README.md).

---

[← Hub index](index.md) · [Sponsor lens](sponsor-lens.md) · [Engineer lens](engineer-agent-lens.md)
