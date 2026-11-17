# Traceable commit evidence — DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON

**Date:** 2026-11-17  
**prompt_type:** `non-tied-close`  
**Request token:** `DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON`

## Scoped staging map (only these paths)

```text
docs/comparisons/afurmanov-harness-profiler.md
docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md
.gitignore
docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md
tied-bundle/docs/harness-trace-observation-loop.md
tools/bundled-prompt-type-skills/external-service-comparison/examples.md
tied-project/non-tied-plans/afurmanov-harness-profiler-vs-tied/
tied-project/working/DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON/
```

## Suggested stage command (sponsor runs)

```bash
cd /Users/fareed/Documents/dev/chatgpt/stdd
git add \
  docs/comparisons/afurmanov-harness-profiler.md \
  docs/comparisons/afurmanov-harness-profiler-vs-tied-agent-management.md \
  .gitignore \
  docs/comparisons/langchain-harness-engineering-vs-tied-agent-management.md \
  tied-bundle/docs/harness-trace-observation-loop.md \
  tools/bundled-prompt-type-skills/external-service-comparison/examples.md \
  tied-project/non-tied-plans/afurmanov-harness-profiler-vs-tied/ \
  tied-project/working/DOC-AFURMANOV-HARNESS-PROFILER-COMPARISON/
```

## Verification before commit

- Wave 2: 14 sections; metadata no-REQ-mint
- `.gitignore` includes `!docs/comparisons/afurmanov-harness-profiler*.md`
- No project `tied-project/{requirements,architecture-decisions,implementation-decisions}.yaml` in stage set

## Push

**Defer** — push only when sponsor asks (skill forbidden automatic push).