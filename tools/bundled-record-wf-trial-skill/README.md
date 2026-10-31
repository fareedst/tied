# bundled-record-wf-trial-skill

Store-only Cursor skill for facilitators grading disposable clients that completed the **four-phase** workflow (`add-feature` → `refine-plan` → `build-plan` → `close-out`) and publishing **trial readouts** under `docs/demos/`.

## Install (TIED store repo)

```bash
cd /path/to/stdd
./tied-install.sh --allow-self-install --layers skills .
```

Then invoke **`@record-wf-trial`** from the store workspace.

## Canonical procedure

See [SKILL.md](./SKILL.md).

## Contrast with `@record-gf-trial`

| Skill | Trial shape |
| --- | --- |
| `@record-gf-trial` | Greenfield / typically `@add-feature` (or legacy single-session) |
| `@record-wf-trial` | **Four explicit sponsor turns**; grades **workflow choreography** |

## Not installed on disposable clients

Listed under `manifest.json` → **`STORE_FACILITATOR_SKILLS`**, not `BUNDLED_STANDALONE_CLIENT_SKILLS`.
