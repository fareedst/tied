# Test strategy — NVIDIA Auto-Ontology Wave 1 capture (doc-only)

No RED unit tests. Manual verification checklist for `@non-tied-build`.

## Tooling preconditions

- [ ] `agent-browser skills get core` run (or documented fallback: raw GitHub only)
- [ ] Source URLs in metadata resolve to `NVIDIA/auto-ontology` `main` branch paths cited in PLAN

## Wave 1 capture content

- [ ] Metadata table: source repo URL, captured date, local-only / no REQ mint disclaimer
- [ ] TL;DR with **NVIDIA-reported** labels on product claims
- [ ] Sections 1–10 per PLAN outline (lifecycle, skills, read/write plane, three reference workflows)
- [ ] Mermaid diagram: valid node IDs (no spaces); read vs write boundary accurate to README + `AGENTS.md`
- [ ] Claim labels: **NVIDIA-reported**, **skill-doc-observed**, **not_measured** where appropriate
- [ ] **No** TIED capability matrix, **no** REQ/ARCH/IMPL tokens in body
- [ ] Related comparisons footnote links only (NDTP, Netflix, Open Ontologies) — no Wave 2 prose

## Consistency gates

- [ ] `AGENTS.md` skill handoff table matches README Generate/Certify/Answer narrative
- [ ] MCP call sequence matches `nvidia-ontology-query` (readiness → terms → answerability → ask)
- [ ] Publication workflow notes fail-closed issues (#250, #265, #267) if publication section included
- [ ] No pasted secrets, hostnames, or credentials from setup skill examples

## Local-only git

- [ ] `git check-ignore -v docs/comparisons/nvidia-auto-ontology.md` shows ignored (not allowlisted)
- [ ] Plan folder files may be committed on `@non-tied-close`; capture stays gitignored unless sponsor opts in

## Commands

```bash
git check-ignore -v docs/comparisons/nvidia-auto-ontology.md
test -f docs/comparisons/nvidia-auto-ontology.md && wc -l docs/comparisons/nvidia-auto-ontology.md
```
