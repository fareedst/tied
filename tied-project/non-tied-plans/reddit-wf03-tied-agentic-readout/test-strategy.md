# Test strategy — Reddit post QA (non-code)

Facilitator checks before calling `@non-tied-close` or publishing.

## Fidelity to readout

- [ ] Sponsor intent matches WF-03 (producer, consumer, wiring, non-UI test, no CLI unless needed).
- [ ] Four turns and outcomes match readout four-turn table.
- [ ] Executable facts: Composer 2.5, ~13 min, exit 0, four sessions, one feature commit after bootstrap, `npm test` 1/1.
- [ ] Imperfections mentioned: gate churn (7 pre_implementation receipts), reconcile not_run, post-commit evidence SHA drift, no tsconfig (tsx only) if discussing tooling.
- [ ] Grades presented as session bands, not methodology proof.
- [ ] Future-test rule paraphrased: one trial ≠ effectiveness claim.

## Sponsor constraints

- [ ] No URLs or repo links in `REDDIT-POST.md` and `REDDIT-COMMENT-SUMMARY.md`.
- [ ] Word count ≥ 2500 in `REDDIT-POST.md`.
- [ ] Tone: direct; no rhetorical hooks; no “you should try TIED.”
- [ ] No Mermaid in Reddit body.

## Structure and readability

- [ ] Each major `##` has a bold one-line thesis for skimmers.
- [ ] Short paragraphs (≤ 5 sentences typical).
- [ ] `---` between major parts.
- [ ] “What this single run does not prove” section with ≥ 4 bullets.

## Security / misrepresentation

- [ ] No claim that agents replace engineers.
- [ ] No model leaderboard or cross-model ranking language.
- [ ] Orchestrator logs described as operator replay aid, not full agent reasoning.
