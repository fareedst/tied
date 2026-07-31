package checklist

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// [IMPL-MODULE_VALIDATION] [ARCH-MODULE_VALIDATION] [REQ-MODULE_VALIDATION]
// [IMPL-GOAGENT-CHECKLIST] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
// How: COMPOSITION_BINDING_VALIDATION — canonical checklist ordering and rendered composition/E2E instructions without UI.

const compositionChecklistYAML = `
name: composition_gate_checklist
version: "0"
process_token: '[PROC-AGENT_REQ_CHECKLIST]'
steps:
  - slug: unit-test-red
    title: RED
    goals: Fail unit tests first.
    tasks:
      - Write failing unit test.
  - slug: unit-test-green
    title: GREEN
    goals: Pass unit tests.
    tasks:
      - Implement unit code to pass.
  - slug: composition-integration
    title: Bindings without UI
    goals: Test bindings between validated modules without invoking the UI.
    preconditions:
      - Unit-level TDD stable for modules being wired.
    tasks:
      - "Identify bindings: event listeners, IPC channels, entry-point delegation."
      - "Write failing composition test for each binding; verifies trigger -> unit called -> arguments -> effect; does not invoke UI."
      - "Write composition code to pass the test. No composition code without preceding failing test."
    references:
      - "tied/docs/composition-coverage.md"
  - slug: end-to-end-ui
    title: UI-only justified
    goals: "Cover behavior that genuinely requires UI invocation. E2E does not substitute for composition tests."
    tasks:
      - "Confirm e2e_only_reason names a platform constraint."
      - "Ensure bindings testable below E2E have composition tests even if E2E also covers them."
      - "Write E2E test; comment justifies why composition-level testing is insufficient."
`

func writeCompositionChecklist(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()
	p := filepath.Join(dir, "composition_checklist.yaml")
	if err := os.WriteFile(p, []byte(strings.TrimLeft(compositionChecklistYAML, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

func TestLoadTurns_compositionOrderingUnitThenCompositionThenE2E(t *testing.T) {
	path := writeCompositionChecklist(t)
	turns, err := LoadTurns(path, Options{})
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"unit-test-red", "unit-test-green", "composition-integration", "end-to-end-ui"}
	if len(turns) != len(want) {
		t.Fatalf("want %d turns, got %d", len(want), len(turns))
	}
	for i, slug := range want {
		if turns[i].StepStub != slug {
			t.Fatalf("order[%d]=%q want %q", i, turns[i].StepStub, slug)
		}
	}
	idx := map[string]int{}
	for i, tr := range turns {
		idx[tr.StepStub] = i
	}
	if !(idx["unit-test-red"] < idx["unit-test-green"] &&
		idx["unit-test-green"] < idx["composition-integration"] &&
		idx["composition-integration"] < idx["end-to-end-ui"]) {
		t.Fatalf("composition gate ordering violated: %#v", idx)
	}
}

func TestLoadTurns_compositionInstructionsAndE2EJustificationRendered(t *testing.T) {
	path := writeCompositionChecklist(t)
	turns, err := LoadTurns(path, Options{StepFromID: "composition-integration", StepToID: "end-to-end-ui"})
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) != 2 {
		t.Fatalf("want 2 turns, got %d", len(turns))
	}
	compBody := strings.Join(turns[0].Parts, "\n")
	for _, needle := range []string{
		"## Step composition-integration:",
		"without invoking the UI",
		"trigger -> unit called -> arguments -> effect",
		"No composition code without preceding failing test",
		"tied/docs/composition-coverage.md",
	} {
		if !strings.Contains(compBody, needle) {
			t.Fatalf("composition turn missing %q in:\n%s", needle, compBody)
		}
	}
	e2eBody := strings.Join(turns[1].Parts, "\n")
	for _, needle := range []string{
		"## Step end-to-end-ui:",
		"e2e_only_reason",
		"platform constraint",
		"does not substitute for composition tests",
		"composition-level testing is insufficient",
	} {
		if !strings.Contains(e2eBody, needle) {
			t.Fatalf("e2e turn missing %q in:\n%s", needle, e2eBody)
		}
	}
}

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

func TestLoadTurns_canonicalChecklistCompositionGateOrder(t *testing.T) {
	// Binding: checklist package → canonical agent-req checklist on disk (UI-free).
	canonical := findCanonicalChecklist(t)
	turns, err := LoadTurns(canonical, Options{
		IncludeSubProcedures: false,
		StepFromID:           "unit-test-red",
		StepToID:             "end-to-end-ui",
	})
	if err != nil {
		t.Fatal(err)
	}
	mustAppear := []string{"unit-test-red", "unit-test-green", "composition-integration", "end-to-end-ui"}
	idx := map[string]int{}
	for i, tr := range turns {
		if tr.StepStub != "" {
			idx[tr.StepStub] = i
		}
	}
	for _, slug := range mustAppear {
		if _, ok := idx[slug]; !ok {
			t.Fatalf("canonical slice missing %q; stubs=%v", slug, idx)
		}
	}
	if !(idx["unit-test-red"] < idx["unit-test-green"] &&
		idx["unit-test-green"] < idx["composition-integration"] &&
		idx["composition-integration"] < idx["end-to-end-ui"]) {
		t.Fatalf("canonical composition ordering violated: %#v", idx)
	}
	var compBody string
	for _, tr := range turns {
		if tr.StepStub == "composition-integration" {
			compBody = strings.Join(tr.Parts, "\n")
			break
		}
	}
	if !strings.Contains(compBody, "composition-coverage.md") {
		t.Fatalf("canonical composition-integration must reference composition-coverage.md:\n%s", compBody)
	}
	if !strings.Contains(compBody, "does not invoke UI") && !strings.Contains(compBody, "without invoking the UI") {
		t.Fatalf("canonical composition-integration must require UI-free tests:\n%s", compBody)
	}
}
