// Composition tests: main config → htmlformat (no agent UI, no shell).
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] [IMPL-GOAGENT-CLI-CMD] [PROC-AGENT_REQ_CHECKLIST] Phase G; Phase H (end-to-end-ui) none — no e2e_only; bindings here + htmlformat unit tests; see IMPL s11_phase_h.
package main

import (
	"strings"
	"testing"

	"stdd/agentstream"
	"stdd/agentstream/config"
)

// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] — When ParseAndResolve has NonCompactHTML off, applyPostPreloadNonCompactHTML is a no-op; Parts unchanged.
func TestComposition_MAPEntry_applyPostPreloadNonCompactHTML_disabled_unchanged_REQ_GOAGENT_NON_COMPACT(t *testing.T) {
	t.Parallel()
	cfg := &config.Config{NonCompactHTML: false, NonCompactHTMLStableIndent: 0}
	turns := []agentstream.Turn{{Parts: []string{`<p>a</p>`}, ChainFromPrevious: false, StepStub: "t"}}
	before := turns[0].Parts[0]
	if err := applyPostPreloadNonCompactHTML(cfg, turns); err != nil {
		t.Fatalf("apply: %v", err)
	}
	if turns[0].Parts[0] != before {
		t.Errorf("when disabled, want unchanged part %q, got %q", before, turns[0].Parts[0])
	}
}

// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT] — Trigger: NonCompactHTML true + stable indent from Config → INTEGRATE_WITH_MAIN mutates Part to non–single-line HTML; preserves Turn non-Parts fields.
func TestComposition_MAPEntry_applyPostPreloadNonCompactHTML_enabled_line_breaks_and_shape_REQ_GOAGENT_NON_COMPACT(t *testing.T) {
	t.Parallel()
	cfg := &config.Config{NonCompactHTML: true, NonCompactHTMLStableIndent: 2}
	turns := []agentstream.Turn{{Parts: []string{`<p>y</p>`}, ChainFromPrevious: true, StepStub: "s"}}
	if err := applyPostPreloadNonCompactHTML(cfg, turns); err != nil {
		t.Fatalf("apply: %v", err)
	}
	out := turns[0].Parts[0]
	if !strings.Contains(out, "\n") {
		t.Fatalf("expected non-compact (line break) in part, got: %q", out)
	}
	if turns[0].ChainFromPrevious != true || turns[0].StepStub != "s" {
		t.Errorf("turn metadata drift: %#v", turns[0])
	}
}
