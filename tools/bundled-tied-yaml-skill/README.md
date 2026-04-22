# Bundled `tied-yaml` skill (copy_files.sh fallback)

This tree mirrors [`.cursor/skills/tied-yaml`](../../.cursor/skills/tied-yaml) so client projects can always receive `tied-cli.sh` and the Cursor skill when [`copy_files.sh`](../../copy_files.sh) runs, even if `.cursor/skills/tied-yaml` is not present in the TIED source checkout.

**Precedence when copying:** `.cursor/skills/tied-yaml` (if present) is preferred; otherwise this bundle is used.

**Maintenance:** When you change the live skill under `.cursor/skills/tied-yaml/`, copy the same files into this directory (or keep them identical in a single pass) so bootstraps stay consistent.
