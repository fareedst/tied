# Comment-length summary (~400 words, no links)

**TL;DR for a top comment or cross-post lead:**

Plain-language summary of one **facilitator readout**. An external orchestrator ran **four separate agent sessions** (define → refine → build → close-out) on a small TypeScript task: producer module, consumer module, wiring module, plus one automated test that never starts a GUI. Composer 2.5 in Cursor; about thirteen minutes wall clock; orchestrator exit zero.

**Executable result:** three ESM modules, one composition test, `npm test` passes on facilitator re-run. No CLI—tests only. Git history had **no source tree until the build phase commit**, which supports documentation-first turns one and two.

**TIED** names a methodology for keeping **requirements, architecture, and implementation records**—including step-wise pseudo-code—in sync with code and tests, linked by stable ids. The output includes a **bundle**: plan, glossary, gate json receipts, evidence envelope, interaction inventory, orchestrator process logs. That bundle records how the run claimed to satisfy a named requirement, including gaps (reconcile skipped, post-commit evidence drift).

**Friction on record:** seven pre-implementation gate files before narrative settled; adherence reconcile **not run** (tooling missing); phase audit is heuristic across four fresh sessions.

**Evidence scope:** one pilot cell; session grades (A on interpretation and traceability, B+ on process) apply to **this run only**. Replication needs the same prompt, agreed proof boundaries, and comparison of gate receipts and git history.

**Takeaway:** Evaluate agentic workflows on **artifact boundaries**—red test archives, close-out gates, envelope validation—alongside green tests.

Store documentation from a TIED 4.0.0 dogfood trial (WF-03).
