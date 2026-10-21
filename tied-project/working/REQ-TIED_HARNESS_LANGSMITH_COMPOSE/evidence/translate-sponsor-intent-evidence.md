# Translate sponsor intent — REQ-TIED_HARNESS_LANGSMITH_COMPOSE

**Sponsor term:** LangSmith

**RESOLVE:**

| Sponsor wording | Canonical term |
| --- | --- |
| LangSmith | **LangSmith** (vendor trace store; **LangChain-reported** metrics only) |
| trace-store automation | **Optional client-side trace export compose** — operator-run script + skill handoff |
| HTOL review inputs | Local JSON/trace excerpts under `tied-project/working/` or caller paths |

**Bounded feature:** `@harness-trace-langsmith-compose` exports or documents export of LangSmith runs to disk, then hands off to `@harness-trace-review` / `@harness-trace-analyzer`.

**Vocabulary:** RECORD in `tied-project/vocab/prompt-composer.md` (harness skill inventory note) at implement.
