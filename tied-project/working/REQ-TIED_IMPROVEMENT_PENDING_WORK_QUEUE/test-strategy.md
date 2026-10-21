# Test strategy — REQ-TIED_IMPROVEMENT_PENDING_WORK_QUEUE

**depth_tier:** minimal · **gate_policy:** advisory

## Approach

Doc-only queue management methodology. One bootstrap contract test guards guide section markers and template path reference. No MCP or runtime modules.

## Cases

1. **RED:** `node --test tools/bootstrap/lib/tied-improvement-pending-work-queue-doc.test.mjs` fails until guide + template exist with required markers.
2. **GREEN:** Guide, template, index/placement links; test passes.
3. **YAML:** `lint_yaml` on new/changed `tied-project/` index and detail files.
4. **Consistency:** `tied_validate_consistency`.
5. **Local seed (operator):** `git check-ignore -v tied-bundle/working/TIED-IMPROVEMENT-PENDING-WORK-QUEUE.md` — not CI.

## Commands

```bash
node --test tools/bootstrap/lib/tied-improvement-pending-work-queue-doc.test.mjs
git check-ignore -v tied-bundle/working/TIED-IMPROVEMENT-PENDING-WORK-QUEUE.md
```
