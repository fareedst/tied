# Software engineering degree × TIED — refined plan (pass 3, build-plan canonical)

| Field | Value |
| --- | --- |
| **Working token** | `DOC-SOFTWARE-ENGINEERING-DEGREE-COMPARISON` (outreach; **no REQ mint**) |
| **Refined** | 2026-10-26 |
| **Supersedes for execution** | [PLAN-refine-pass2.md](./PLAN-refine-pass2.md) (inventory + structure); [PLAN-refine-pass1.md](./PLAN-refine-pass1.md) (draft matrix + git snippets) |
| **Tracker** | [checklist-tracker-refine.yaml](./checklist-tracker-refine.yaml) |
| **Test strategy** | [test-strategy.md](./test-strategy.md) |
| **Process** | [@external-service-comparison](../../../tools/bundled-prompt-type-skills/external-service-comparison/SKILL.md) |

---

## Pass 3 reconciliation (execution state)

| Item | State |
| --- | --- |
| [software-engineering-degree.md](../../../docs/comparisons/software-engineering-degree.md) Wave 1 normalize | **Done** (2026-10-26 build-plan) |
| [software-engineering-degree-vs-tied.md](../../../docs/comparisons/software-engineering-degree-vs-tied.md) | **Done** — 887 inventory rows |
| `.gitignore` allowlist | **Done** |
| `examples.md` row | **Done** |

Pass 1 and pass 2 refined scope only. **build-plan** is the next prompt-type; a third refine pass does not substitute for it.

**Sponsor thesis (unchanged):** TIED behaves like a **CS graduate software engineer** — each curriculum list item gets **Interpretation** + **Observance** under planes **M** / **A** / **C**.

---

## Source inventory (verified 2026-10-26)

| Metric | Count | Notes |
| --- | ---: | --- |
| Courses | 16 | `## Course N.` headings |
| Numbered modules | 167 | Lines matching `N.` module titles inside courses |
| Hyphen list items (total) | **887** | `rg '^- '` on capture |
| List items under courses 1–16 | **884** | Module-attached detail points |
| Framing list items (pre–Course 1) | **3** | Course / Module / Detailed coverage definitions |

**Sponsor copy vs measurable rows:** Capture intro states “~175 instructional modules.” This file has **167 numbered module headings** — treat **167** as the module table count for verification; cite **Sponsor-proposed ~175** only in Wave 2 source summary as approximate scope text, not as a row target.

### Per-course detail-point counts (build-plan receipt target)

| Course | Modules | Detail rows |
| ---: | ---: | ---: |
| 1 | 8 | 40 |
| 2 | 9 | 45 |
| 3 | 9 | 45 |
| 4 | 9 | 45 |
| 5 | 10 | 50 |
| 6 | 10 | 50 |
| 7 | 10 | 50 |
| 8 | 10 | 51 |
| 9 | 10 | 51 |
| 10 | 11 | 58 |
| 11 | 11 | 61 |
| 12 | 11 | 61 |
| 13 | 11 | 59 |
| 14 | 13 | 78 |
| 15 | 13 | 78 |
| 16 | 12 | 62 |
| **Framing** | — | **3** |
| **Total** | **167** | **887** |

Wave 2 must include **887** analysis rows: **884** under course/module tables plus **3** rows in a short **Curriculum framing** subsection (before Part I or under Source summary cross-reference).

---

## Observance planes and row contract

| Column | Rule |
| --- | --- |
| **Curriculum point** | Verbatim or tight paraphrase of the source `-` line |
| **Interpretation** | 1–2 sentences: graduate-engineer judgment under TIED lens |
| **Observance** | Prefix with **M:** / **A:** / **C:** as applicable; cite anchors sparingly in Courses 7–15 |
| **Disposition** | Align · Composable · Tension · Gap · Defer · N/A |
| **Plane** | M · A · C (one or more) |

### Pattern library (Courses 1–6 and much of 12–13)

Reuse these observance templates to keep 887 rows readable (vary Interpretation per point):

| Pattern ID | Typical curriculum theme | Observance shorthand | Disposition | Plane |
| --- | --- | --- | --- | --- |
| P-A-impl | Language, DS, debugging, I/O | **M:** —; **A:** expected when implementing/testing client code; **C:** Defer labs/CI unless client REQ | Composable | A |
| P-A-algo | Algorithms, complexity, graphs | **M:** —; **A:** select/analyze implementations in client work; **C:** Defer formal course assessment | Gap | A |
| P-M-trace | Requirements, traceability, identifiers | **M:** REQ/ARCH/IMPL + `tied_validate_consistency`; **A:** token comments in tests/code | Align | M,A |
| P-M-tdd | TDD, RED/GREEN, test levels | **M:** `[PROC-TIED_DEV_CYCLE]`; **A:** write failing tests before production code | Align | M,A |
| P-M-spec | Preconditions, contracts, pseudo-code | **M:** IMPL PRE/POST/EFFECTS + `pseudocode_validate`; **A:** honor contracts in code | Align | M,A |
| P-M-vocab | Domain terms, ambiguity | **M:** `[PROC-VOCABULARY_INDEX]` RESOLVE/RECORD; **A:** consistent naming in artifacts | Align | M,A |
| P-M-agent | MCP, skills, delegation, gates | **M:** bounded MCP + prompt-type skills + sponsor ladder; **A:** least-privilege tool use | Partial → Composable | M,A |
| P-C-ops | CI/CD, cloud, SRE, deploy | **M:** —; **A:** apply when client owns pipeline; **C:** Defer as TIED methodology core | Defer | C |
| P-M-evidence | Evidence, verification, claims | **M:** gates, envelopes, proof boundaries; **A:** reproducible commands in client repo | Align | M,A |

Courses **7–15**: prefer point-specific Interpretation; still reuse pattern IDs in Observance where accurate.

---

## Implement (build-plan — sole execution authority)

### Phase 0 — Git allowlist

After NDTP lines in [`.gitignore`](../../../.gitignore):

```gitignore
!docs/comparisons/software-engineering-degree.md
!docs/comparisons/software-engineering-degree-vs-tied.md
```

### Phase 1 — Wave 1 normalize

Edit capture only at top; preserve `# I.` … `# IV.` and all course bodies.

- Metadata table (**Source:** Sponsor-proposed, in-repo; **Captured:** 2026-10-26; **Analysis (sibling):** link to Wave 2)
- TL;DR (5 bullets)
- **Notes for stdd readers:** proof boundary; **887** row target; link Wave 2

### Phase 2 — Wave 2 scaffold (14 analytical sections)

File: `docs/comparisons/software-engineering-degree-vs-tied.md`

Order: metadata preamble → Executive summary … Explicit non-adoptions → **Proof boundary** → **Related documents** → TOC → **Curriculum framing (3 rows)** → Parts I–IV.

Include draft **course-level capability matrix** from [PLAN-refine-pass1.md](./PLAN-refine-pass1.md) § Wave 2 — Primary capability matrix.

**Sibling ownership:** [tied-vs-well-known-methodologies.md](../../../docs/comparisons/tied-vs-well-known-methodologies.md) (org process); this doc (graduate competency grid). Cross-link factory/harness docs only where Course 14–15 overlap.

### Phase 3 — Bullet inventory (batched)

Single file; author in order:

1. Curriculum framing (3)
2. Part III — Courses 13–15 (215 rows)
3. Part II — Courses 7–12 (331 rows)
4. Part I — Courses 1–6 (275 rows)
5. Part IV — Course 16 (62 rows)

**Total: 887 rows.**

### Phase 4 — Verification

Create:

- [evidence/bullet-count-receipt.md](./evidence/bullet-count-receipt.md) — table above with **actual** Wave 2 counts per course
- [evidence/build-plan-handoff.md](./evidence/build-plan-handoff.md) — test-strategy results, gate note, files touched

Run [test-strategy.md](./test-strategy.md). Skip `tied_validate_consistency`.

### Phase 5 — Optional

One row in [examples.md](../../../tools/bundled-prompt-type-skills/external-service-comparison/examples.md).

---

## Gate and scope (unchanged)

- `profile_depth: minimal` · `gate_policy: outreach_doc_only` · `no_req_mint: true`
- `tied_checklist_gate_validate` `pre_implementation` → **allowed: false** (sparse DOC tracker) — [evidence/refine-pass1-gate-note.md](./evidence/refine-pass1-gate-note.md)
- **Not** REQ implementation authorization; **build-plan** may proceed

---

## Anti-patterns (build-plan must include in Wave 2 §9)

- Equating **`tied_validate_consistency`** with CS foundations mastery
- Treating curriculum coverage as TIED certification
- Chat or agent narrative as requirements without REQ/ARCH/IMPL
- Unbounded agent autonomy without checklist gates (Course 14–15 themes)
- Implying TIED ships DevOps/cloud/LLM runtime (Courses 12–13 **Defer C** / **Gap M**)

---

## Sponsor next step

| Action | When |
| --- | --- |
| **build-plan** linked to **this file** | Write Wave 1 + Wave 2 + allowlist + evidence |
| **refine-plan** again | Only if thesis, granularity, or file split policy changes |
| **git commit** | Sponsor-owned after review |

**Refine-plan status:** Complete (pass 3, 2026-10-26) — **canonical for build-plan**.  
**Build-plan status:** Complete (2026-10-26). Handoff: [evidence/build-plan-handoff.md](./evidence/build-plan-handoff.md).
