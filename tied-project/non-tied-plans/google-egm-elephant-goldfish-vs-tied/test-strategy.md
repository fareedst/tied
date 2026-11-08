# Test strategy — Google EGM × TIED (doc-only)

No RED unit tests. Manual verification checklist for `@non-tied-build`.

## Preconditions

- [ ] Plan slug `google-egm-elephant-goldfish-vs-tied` matches [PLAN.md](PLAN.md)
- [ ] Upstream sources reachable: EGM README + `docs/designs/architecture.md` on GitHub

## Primary analysis content

- [ ] Metadata table per harness-sibling pattern (Purpose, Source URL, Distinct from, TIED anchors, status: reference only)
- [ ] Executive summary includes center-of-gravity comparison **and** Q1–Q6 evaluation-framework disposition table
- [ ] Source summary: four failure modes + five lifecycle phases + five-stage review; **EGM-reported** / upstream labels
- [ ] Failure modes mapped to TIED bootstrap / IMPL-before-code / LEAP
- [ ] Skill inventory table covers brainstorm, draft, review, resolve, drift-report, bootstrap, review-loop
- [ ] Harness vs platform seam cites Traefik comparison + authority-boundary checklist
- [ ] Touchpoint 1 RESOLVE table with explicit **non-1:1** rows (Goldfish vs `tied_verify`)
- [ ] Capability matrix **12–15** rows; disposition vocabulary only
- [ ] Mermaid diagram: valid syntax, node IDs without spaces
- [ ] Composition playbook: sponsor SoT + translate to REQ scope
- [ ] **No** new REQ/ARCH/IMPL tokens minted in analysis body (bracketed PROC/REQ references to existing tokens OK)

## Consistency gates

- [ ] Does not claim TIED ships EGM plugin or Goldfish personas
- [ ] Does not equate implementation-readiness rubric pass with `tied_verify` or Q1 arms
- [ ] Fresh-subagent harness requirement called out where host cannot spawn reviewers
- [ ] Dual spec authority labeled **Tension** / sponsor costly choice
- [ ] LangWatch / Cursor / LangChain overlap explicit in Distinct from

## Optional committed cross-edits (build opt-in)

- [ ] Evaluation framework External narrative control row for EGM (if sponsor requested)
- [ ] Matrix §2 row 19 only if sponsor opted in **and** REQ row-count updated

## Local-only git

- [ ] `git check-ignore -v docs/comparisons/google-egm-elephant-goldfish-vs-tied-agent-management.md` shows ignored (expected)
- [ ] Plan folder committable on `@non-tied-close`

## Commands

```bash
git check-ignore -v docs/comparisons/google-egm-elephant-goldfish-vs-tied-agent-management.md
test -f docs/comparisons/google-egm-elephant-goldfish-vs-tied-agent-management.md && wc -l docs/comparisons/google-egm-elephant-goldfish-vs-tied-agent-management.md
rg -n '^REQ-[A-Z0-9_]+:' docs/comparisons/google-egm-elephant-goldfish-vs-tied-agent-management.md || true
```
