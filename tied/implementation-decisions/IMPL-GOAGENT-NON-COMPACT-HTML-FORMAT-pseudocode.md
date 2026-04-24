# [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
# Summary: When enabled, a single post-Build, post-ApplyPromptFilePreload pass reformats each string in Turn.Parts to non-compact UTF-8 HTML; turn order, count, and ChainFromPrevious are unchanged. Default: disabled (no-op).

# [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] — How: contract / vocabulary (inputs, outputs, invariants).
CONTRACT:
  INPUT: `turns` ([]Turn) produced after IMPL-GOAGENT-PIPELINE.Build, ReadPromptFilePreload, and ApplyPromptFilePreload in IMPL-GOAGENT-CLI-CMD/IMPL-GOAGENT-PIPELINE; `options` from Config (e.g. enabled, stable indent). Bodies in Parts originate as markdown/plain from IMPL-GOAGENT-CHECKLIST, IMPL-GOAGENT-TDDLOOP, IMPL-GOAGENT-FEATURESPEC, IMPL-GOAGENT-TEXT-SOURCES — unchanged in structure, only in string form when this transform runs.
  OUTPUT: Same `[]Turn` length and order; same `Turn` fields; when enabled, only string content of `Parts` elements may change; when disabled, identical in/out content.
  DATA: UTF-8; REQ satisfaction: same logical part text + same options => identical HTML string per part (determinism for tests).
  CONTROL: `options.enabled` from ParseAndResolve default false; if false, no mutation. Does not re-read YAML, alter step slugs, modify ChainFromPrevious, or invoke IMPL-GOAGENT-EXECUTOR (callers are unchanged; executor remains strictly downstream in IMPL-GOAGENT-CLI-CMD main).

# How: Composition and ordering for related_decisions `depends_on` and `composed_with` — no new runtime call into IMPL-B from this package except the documented hook from main.
#   PRE: `pipeline.Build` returned `[]Turn`; `ApplyPromptFilePreload` applied. POST: `Parts` optionally HTML, chain slice unchanged, session logic unchanged. ORDER: Build → (FirstTurn slice, if any) → ReadPromptFilePreload → ApplyPromptFilePreload → **APPLY_TO_TURNS (this IMPL)** → runTiedPreflight (optional) → runDryRun or per-turn `executor.Run`. SHARED: `[]Turn` in process memory. IMPL-GOAGENT-PIPELINE supplies `Build`; IMPL-GOAGENT-CLI-CMD owns slice/preload/preflight/executor; this IMPL only string-transforms Parts.

procedure APPLY_TO_TURNS(turns, options):
  # How: no-op if disabled; else in-place part replacement; propagate any FORMAT error
  IF not options.enabled:
    RETURN (turns, nil)
  FOR each turn IN turns:
    FOR each index i IN 0..len(turn.Parts)-1:
      s, err := FORMAT_NON_COMPACT_HTML(turn.Parts[i], options)
      ON err: RETURN (nil, err)
      turn.Parts[i] = s
  RETURN (turns, nil)

procedure FORMAT_NON_COMPACT_HTML(part, options):
  # How: map one part string to a stable, non–single-line HTML form; empty string returns empty, no error; if off, pass-through (matches Apply when disabled, or direct public API)
  IF part == "":
    RETURN ("", nil)
  IF not options.enabled:
    RETURN (part, nil)
  out := DETERMINISTIC_NON_COMPACT_HTML_FOR_PART(part, options)
  RETURN (out, nil)

procedure DETERMINISTIC_NON_COMPACT_HTML_FOR_PART(text, options):
  # How: [IMPL/ARCH/REQ] UTF-8 deterministic: replace "><" with ">" newline "<" for adjacent tags; if no newline yet, insert newline after first ">" (e.g. <p>text</p>); if no ">", append newline to plain text; if options.stable_indent>0, prefix every continuation line with that many spaces. (Go: htmlformat.deterministicNonCompactHTMLForPart; unit tests in htmlformat_test.go.)

# [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] and caller [IMPL-GOAGENT-CLI-CMD] [ARCH-GOAGENT-CLI] [REQ-GOAGENT-CLI-CONFIG] — integration and orchestration; does not duplicate the HTML format contract; documents where IMPL-CLI calls into this IMPL.
# How: After ApplyPromptFilePreload, when the resolved `cfg` enables non-compact-HTML, run APPLY_TO_TURNS before runTiedPreflight, then dry-run or per-turn `executor.Run`. Dry-run and live use the same transform. IMPL-GOAGENT-PIPELINE and checklist/tddloop/FEATURE packages are not edited here; IMPL-GOAGENT-EXECUTOR remains downstream; this block is the single composition edge from `main` into APPLY_TO_TURNS (cross-IMPL call from IMPL-GOAGENT-CLI-CMD into this module).

procedure INTEGRATE_WITH_MAIN(cfg, turns, options):
  # How: nil guards; skip when the CLI flag/field is off; propagate format errors to main as non-zero exit or printed error
  IF cfg is nil OR turns is nil:
    RETURN
  IF not (cfg has non-compact-HTML option true):
    RETURN
  t2, err := APPLY_TO_TURNS(turns, options)
  # How: in-place update; t2 is same object as turns if implementation mutates in place; ON error bail out. While FORMAT has no err returns in the current Go seam, the branch is live (IntegrateWithMain); unit assertion when FORMAT surfaces non-nil error is composition-level or a later IMPL change.
  ON err != nil: return error to main

procedure MAP_CONFIG_TO_HTMLFORMAT_OPTIONS(resolved_config, turns):
  # [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-CLI] [REQ-GOAGENT-CLI-CONFIG] — How: from ParseAndResolve output, derive CfgForIntegrate{non_compact: resolved_config} and options { enabled: same, stable_indent: from --non-compact-html-indent } with no I/O. Go: applyPostPreloadNonCompactHTML in cmd/agentstream; then INTEGRATE_WITH_MAIN (composition-tested against htmlformat).
  # How: in-place on `turns` via INTEGRATE_WITH_MAIN; return value is error in Go, not t2

# [IMPL-GOAGENT-CLI-CMD] order: main calls MAP via applyPostPreloadNonCompactHTML once after ApplyPromptFilePreload; before runTiedPreflight and before executor/dry-run argv assembly.

# [PROC-IMPL_CODE_TEST_SYNC] Phase H (end-to-end-ui) — E2E / e2e_only boundary
# [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-MODULE_VALIDATION] [PROC-TEST_STRATEGY] [PROC-AGENT_REQ_CHECKLIST] — How: this IMPL’s procedures (APPLY_TO_TURNS, FORMAT, MAP, INTEGRATE) are pure in-process UTF-8 string work plus resolved CLI flags. There is no named platform UI constraint (native OS menu, web rendering pipeline, or window server) that must be observed for correctness of the non-compact line-break contract; a Playwright, Cursor, or other full-stack E2E would not add a testable signal beyond unit tests (htmlformat) and cmd composition (compose_noncompact). e2e_only: false; phase H skipped with s11_phase_h in IMPL detail. [IMPL-ATDD-E2E-AGENT_STREAM] remains the separate concern for Ruby/subprocess stream parity upstream of agentstream.
