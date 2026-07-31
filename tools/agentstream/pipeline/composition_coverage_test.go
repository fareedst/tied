package pipeline

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"stdd/agentstream"
)

// [IMPL-MODULE_VALIDATION] [ARCH-MODULE_VALIDATION] [REQ-MODULE_VALIDATION]
// [IMPL-GOAGENT-PIPELINE] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
// How: COMPOSITION_BINDING_VALIDATION — pipeline↔checklist binding evidence, ordering, control-flow, E2E exclusion; UI-free.

func findCanonicalChecklist(t *testing.T) string {
	t.Helper()
	dir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	for {
		p := filepath.Join(dir, "tied", "docs", "agent-req-implementation-checklist.yaml")
		if st, err := os.Stat(p); err == nil && !st.IsDir() {
			return p
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			t.Skip("canonical checklist not found walking from package dir")
		}
		dir = parent
	}
}

func TestBuild_compositionBindingPositiveRoutingAndEffects(t *testing.T) {
	// Binding: CLI/Input → pipeline.Build → checklist.LoadTurns (arguments + effect).
	dir := t.TempDir()
	cl := filepath.Join(dir, "checklist.yaml")
	y := `
name: binding_inventory
version: "0"
process_token: '[PROC-AGENT_REQ_CHECKLIST]'
steps:
  - slug: unit-test-red
    title: RED
    tasks: [write failing unit test]
  - slug: composition-integration
    title: Composition
    goals: "Test bindings without invoking the UI."
    tasks:
      - "Write failing composition test; trigger -> callee -> arguments -> effect."
      - "No composition code without preceding failing test."
  - slug: end-to-end-ui
    title: E2E
    goals: "UI-only with platform constraint."
    tasks:
      - "e2e_only_reason must name a platform constraint."
`
	if err := os.WriteFile(cl, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	turns, err := Build(Input{
		LeadChecklistYAML:       cl,
		LeadChecklistSkipSub:    true,
		LeadChecklistStepFromID: "composition-integration",
		LeadChecklistStepToID:   "end-to-end-ui",
		ChecklistVars:           map[string]string{"FEATURE": "binding-gate"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) != 2 {
		t.Fatalf("want 2 turns from bounded checklist binding, got %d", len(turns))
	}
	if turns[0].StepStub != "composition-integration" || turns[1].StepStub != "end-to-end-ui" {
		t.Fatalf("argument propagation failed: stubs=%q,%q", turns[0].StepStub, turns[1].StepStub)
	}
	body := strings.Join(turns[0].Parts, "\n")
	if !strings.Contains(body, "without invoking the UI") {
		t.Fatalf("effect missing UI-free composition instruction: %s", body)
	}
	if !strings.Contains(body, "trigger -> callee -> arguments -> effect") {
		t.Fatalf("effect missing binding assertion contract: %s", body)
	}
	e2e := strings.Join(turns[1].Parts, "\n")
	if !strings.Contains(e2e, "platform constraint") {
		t.Fatalf("E2E justification effect missing: %s", e2e)
	}
}

func TestBuild_compositionOrderingBeforeE2E(t *testing.T) {
	dir := t.TempDir()
	cl := filepath.Join(dir, "checklist.yaml")
	y := `
name: order
version: "0"
steps:
  - slug: unit-test-green
    title: Green
    tasks: [g]
  - slug: composition-integration
    title: Composition
    tasks: [c]
  - slug: end-to-end-ui
    title: E2E
    tasks: [e]
`
	if err := os.WriteFile(cl, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	turns, err := Build(Input{LeadChecklistYAML: cl, LeadChecklistSkipSub: true})
	if err != nil {
		t.Fatal(err)
	}
	idx := KnownStepStubs(turns)
	if !idx["unit-test-green"] || !idx["composition-integration"] || !idx["end-to-end-ui"] {
		t.Fatalf("missing required composition gate steps: %#v", idx)
	}
	pos := map[string]int{}
	for i, tr := range turns {
		pos[tr.StepStub] = i
	}
	if !(pos["unit-test-green"] < pos["composition-integration"] &&
		pos["composition-integration"] < pos["end-to-end-ui"]) {
		t.Fatalf("unit → composition → e2e ordering violated: %#v", pos)
	}
}

func TestReplaceRemainingFromStep_missingBindingFails(t *testing.T) {
	// Missing binding in inventory / goto target: control path must fail closed.
	turns := []agentstream.Turn{
		{Parts: []string{"green"}, StepStub: "unit-test-green"},
		{Parts: []string{"comp"}, StepStub: "composition-integration"},
	}
	_, err := ReplaceRemainingFromStep(turns, 0, "not-in-binding-inventory")
	if err == nil {
		t.Fatal("want missing-binding failure")
	}
	if !strings.Contains(err.Error(), "target step not found") {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestReplaceRemainingFromStep_compositionControlFlowRouting(t *testing.T) {
	// Positive control-flow: after composition failure signal, loop back to unit-test-red then re-enter composition.
	turns := []agentstream.Turn{
		{Parts: []string{"red"}, StepStub: "unit-test-red", ChainFromPrevious: true},
		{Parts: []string{"green"}, StepStub: "unit-test-green", ChainFromPrevious: true},
		{Parts: []string{"comp"}, StepStub: "composition-integration", ChainFromPrevious: false},
		{Parts: []string{"e2e"}, StepStub: "end-to-end-ui", ChainFromPrevious: true},
	}
	got, err := ReplaceRemainingFromStep(turns, 2, "unit-test-red")
	if err != nil {
		t.Fatal(err)
	}
	var stubs []string
	for _, tr := range got {
		stubs = append(stubs, tr.StepStub)
	}
	want := []string{
		"unit-test-red",
		"unit-test-green",
		"composition-integration",
		"unit-test-red",
		"unit-test-green",
		"composition-integration",
		"end-to-end-ui",
	}
	if strings.Join(stubs, ",") != strings.Join(want, ",") {
		t.Fatalf("control-flow stubs mismatch:\n got %v\nwant %v", stubs, want)
	}
}

func TestBuild_canonicalChecklistCompositionInstructions(t *testing.T) {
	checklistPath := findCanonicalChecklist(t)
	turns, err := Build(Input{
		LeadChecklistYAML:       checklistPath,
		LeadChecklistSkipSub:    true,
		LeadChecklistStepFromID: "composition-integration",
		LeadChecklistStepToID:   "end-to-end-ui",
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) < 2 {
		t.Fatalf("want composition + e2e turns, got %d", len(turns))
	}
	if turns[0].StepStub != "composition-integration" {
		t.Fatalf("first stub=%q", turns[0].StepStub)
	}
	comp := strings.Join(turns[0].Parts, "\n")
	for _, needle := range []string{
		"composition-coverage.md",
		"does not invoke UI",
		"No composition code without preceding failing test",
	} {
		if !strings.Contains(comp, needle) {
			t.Fatalf("canonical composition instructions missing %q:\n%s", needle, comp)
		}
	}
	var e2e string
	for _, tr := range turns {
		if tr.StepStub == "end-to-end-ui" {
			e2e = strings.Join(tr.Parts, "\n")
			break
		}
	}
	if e2e == "" {
		t.Fatal("end-to-end-ui turn missing from canonical slice")
	}
	for _, needle := range []string{
		"named platform constraint",
		"does not substitute for composition tests",
	} {
		if !strings.Contains(e2e, needle) {
			t.Fatalf("canonical E2E justification missing %q:\n%s", needle, e2e)
		}
	}
}
