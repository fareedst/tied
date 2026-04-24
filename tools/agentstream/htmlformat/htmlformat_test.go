// Unit tests for IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT (procedure mapping: IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT-pseudocode.md).
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] [PROC-AGENT_REQ_CHECKLIST]
package htmlformat

import (
	"strings"
	"testing"

	"stdd/agentstream"
)

func opts(enabled bool, stableIndent int) Options {
	return Options{Enabled: enabled, StableIndent: stableIndent}
}

func assertHasLineBreak(t *testing.T, s, where string) {
	t.Helper()
	if !strings.Contains(s, "\n") {
		t.Errorf("%s: want non-compact (at least one line break), got one-line: %q", where, s)
	}
}

// --- CONTRACT
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
// Validates: same part + same options => identical string (satisfaction: deterministic per REQ); when enabled, APPLY preserves turn count and per-turn field shape (only Part strings may change; ChainFromPrevious / StepStub unchanged from CONTRACT).
func TestCONTRACT_REQ_GOAGENT_NON_COMPACT_HTML_FORMAT(t *testing.T) {
	t.Run("determinism_equal_inputs_equal_outputs", func(t *testing.T) {
		t.Parallel()
		const in = "<p>x</p>"
		o := opts(true, 2)
		a, e1 := FormatNonCompactHTML(in, o)
		b, e2 := FormatNonCompactHTML(in, o)
		if e1 != nil || e2 != nil {
			t.Fatalf("err: %v %v", e1, e2)
		}
		if a != b {
			t.Errorf("REQ determinism: two FORMAT calls: %q vs %q", a, b)
		}
	})
	t.Run("apply_preserves_turn_list_shape", func(t *testing.T) {
		t.Parallel()
		turns := []agentstream.Turn{
			{Parts: []string{"a", "b"}, ChainFromPrevious: true, StepStub: "s1"},
			{Parts: []string{"c"}, ChainFromPrevious: false, StepStub: "s2"},
		}
		_, err := ApplyToTurns(turns, opts(true, 1))
		if err != nil {
			t.Fatalf("APPLY: %v", err)
		}
		if len(turns) != 2 {
			t.Fatalf("turn count: %d", len(turns))
		}
		if turns[0].ChainFromPrevious != true || turns[0].StepStub != "s1" || len(turns[0].Parts) != 2 {
			t.Errorf("turn 0 shape: %#v", turns[0])
		}
		if turns[1].ChainFromPrevious != false || turns[1].StepStub != "s2" || len(turns[1].Parts) != 1 {
			t.Errorf("turn 1 shape: %#v", turns[1])
		}
	})
}

// --- procedure APPLY_TO_TURNS
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
// Validates: when options.enabled is false, identical in/out; when true, each Part string is replaced with FORMAT output (non-compact: human-/diff-friendly with line breaks per REQ/ARCH).
func TestAPPLY_TO_TURNS_REQ_GOAGENT_NON_COMPACT_HTML_FORMAT(t *testing.T) {
	t.Run("disabled_no_mutation", func(t *testing.T) {
		t.Parallel()
		// [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] default / opt-out: unchanged run content
		turns := []agentstream.Turn{{Parts: []string{"<p>one</p>"}, ChainFromPrevious: true}}
		cp := copyTurns(turns)
		out, err := ApplyToTurns(turns, opts(false, 2))
		if err != nil {
			t.Fatalf("APPLY_TO_TURNS disabled: %v", err)
		}
		if out == nil {
			t.Fatal("expected non-nil turns slice")
		}
		if !turnsEqual(cp, out) {
			t.Fatalf("disabled: expected identical parts, before %#v after %#v", cp, out)
		}
	})
	t.Run("enabled_non_compact_line_breaks", func(t *testing.T) {
		t.Parallel()
		// [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] UTF-8 HTML with line breaks, not one minified line
		turns := []agentstream.Turn{{Parts: []string{"<p>one</p>"}, ChainFromPrevious: false}}
		_, err := ApplyToTurns(turns, opts(true, 2))
		if err != nil {
			t.Fatalf("APPLY_TO_TURNS enabled: %v", err)
		}
		assertHasLineBreak(t, turns[0].Parts[0], "APPLY_TO_TURNS enabled")
	})
}

// --- procedure FORMAT_NON_COMPACT_HTML
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
// Validates: empty -> ("", nil); when enabled, stable non–single-line HTML for non-empty (maps one part string; determinism in DETERMINISTIC).
func TestFORMAT_NON_COMPACT_HTML_REQ_GOAGENT_NON_COMPACT_HTML_FORMAT(t *testing.T) {
	t.Run("when_disabled_non_empty_unchanged", func(t *testing.T) {
		t.Parallel()
		// [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] non-selected mode: unchanged
		const in = "<p>q</p>"
		s, err := FormatNonCompactHTML(in, opts(false, 2))
		if err != nil {
			t.Fatal(err)
		}
		if s != in {
			t.Errorf("pass-through: got %q want %q", s, in)
		}
	})
	t.Run("empty_part_no_error", func(t *testing.T) {
		t.Parallel()
		s, err := FormatNonCompactHTML("", opts(true, 1))
		if err != nil {
			t.Fatalf("empty part: %v", err)
		}
		if s != "" {
			t.Errorf("empty part: got %q want empty", s)
		}
	})
	t.Run("enabled_adds_line_breaks_for_simple_html", func(t *testing.T) {
		t.Parallel()
		in := "<p>hello</p>"
		s, err := FormatNonCompactHTML(in, opts(true, 2))
		if err != nil {
			t.Fatalf("format: %v", err)
		}
		assertHasLineBreak(t, s, "FORMAT")
	})
}

// --- procedure DETERMINISTIC_NON_COMPACT_HTML_FOR_PART
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
// Validates: same inputs yield stable, non-minified string per satisfaction_criteria (determinism for tests; concrete tags/whitespace in unit-test-green).
func TestDETERMINISTIC_NON_COMPACT_HTML_FOR_PART_REQ_GOAGENT_NON_COMPACT_HTML_FORMAT(t *testing.T) {
	t.Parallel()
	const in = "<div><span>a</span></div>"
	out := deterministicNonCompactHTMLForPart(in, opts(true, 2))
	// [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] human- and diff-friendly, not a single minified line
	assertHasLineBreak(t, out, "DETERMINISTIC")
}

// --- procedure INTEGRATE_WITH_MAIN
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
// Validates: nil guards, skip when off; when cfg + enabled path, APPLY_TO_TURNS mutates parts to non-compact shape. Main maps [config.Config] → CfgForIntegrate in cmd (compose_noncompact + composition tests). ON err: IntegrateWithMain returns a wrapped err when ApplyToTurns fails; not unit-observed while FormatNonCompactHTML never returns a non-nil error.
func TestINTEGRATE_WITH_MAIN_REQ_GOAGENT_NON_COMPACT_HTML_FORMAT(t *testing.T) {
	t.Run("nil_cfg_is_noop", func(t *testing.T) {
		t.Parallel()
		turns := []agentstream.Turn{{Parts: []string{"x"}}}
		err := IntegrateWithMain(nil, turns, opts(true, 2))
		if err != nil {
			t.Fatalf("nil cfg: %v", err)
		}
	})
	t.Run("non_compact_off_skips", func(t *testing.T) {
		t.Parallel()
		cfg := &CfgForIntegrate{NonCompactHTML: false}
		turns := []agentstream.Turn{{Parts: []string{"<p>x</p>"}}}
		before := turns[0].Parts[0]
		if err := IntegrateWithMain(cfg, turns, opts(true, 2)); err != nil {
			t.Fatalf("integrate: %v", err)
		}
		if turns[0].Parts[0] != before {
			t.Errorf("when config opts out, parts should be unchanged, got %q", turns[0].Parts[0])
		}
	})
	t.Run("on_applies_apply_to_turns", func(t *testing.T) {
		t.Parallel()
		cfg := &CfgForIntegrate{NonCompactHTML: true}
		turns := []agentstream.Turn{{Parts: []string{"<p>y</p>"}, ChainFromPrevious: true}}
		if err := IntegrateWithMain(cfg, turns, opts(true, 2)); err != nil {
			t.Fatalf("integrate: %v", err)
		}
		assertHasLineBreak(t, turns[0].Parts[0], "INTEGRATE_WITH_MAIN")
	})
}

func copyTurns(turns []agentstream.Turn) []agentstream.Turn {
	out := make([]agentstream.Turn, len(turns))
	for i := range turns {
		p := make([]string, len(turns[i].Parts))
		copy(p, turns[i].Parts)
		out[i] = agentstream.Turn{Parts: p, ChainFromPrevious: turns[i].ChainFromPrevious, StepStub: turns[i].StepStub}
	}
	return out
}

func turnsEqual(a, b []agentstream.Turn) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i].ChainFromPrevious != b[i].ChainFromPrevious || a[i].StepStub != b[i].StepStub {
			return false
		}
		if len(a[i].Parts) != len(b[i].Parts) {
			return false
		}
		for j := range a[i].Parts {
			if a[i].Parts[j] != b[i].Parts[j] {
				return false
			}
		}
	}
	return true
}
