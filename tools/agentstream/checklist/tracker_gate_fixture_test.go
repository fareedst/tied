// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: export language-neutral Tracker fixture for TypeScript gate composition tests.
package checklist

import (
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

func TestExportGateWriterMinimalFixture(t *testing.T) {
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	dir := filepath.Join(filepath.Dir(file), "testdata")
	def := filepath.Join(dir, "gate-fixture-checklist.yaml")
	out := filepath.Join(dir, "gate-writer-minimal-tracker.yaml")
	if err := MaterializeAuthoritativeTracker(def, out, MaterializeOptions{
		RequestToken: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT",
		Name:         "writer-gate-minimal-fixture",
	}); err != nil {
		t.Fatal(err)
	}
	tracker, err := LoadTrackerYAML(out)
	if err != nil {
		t.Fatal(err)
	}
	tracker["source_document"] = "tools/agentstream/checklist/testdata/gate-fixture-checklist.yaml"
	applyMinimalGateFixtureDispositions(t, tracker)
	if err := atomicWriteYAML(out, tracker); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(out); err != nil {
		t.Fatal(err)
	}
}

func applyMinimalGateFixtureDispositions(t *testing.T, tracker map[string]interface{}) {
	t.Helper()
	steps, ok := tracker["steps"].([]interface{})
	if !ok {
		t.Fatal("missing steps")
	}
	for i, item := range steps {
		row, ok := item.(map[string]interface{})
		if !ok {
			continue
		}
		slug, _ := row["slug"].(string)
		switch slug {
		case "session-bootstrap", "translate-sponsor-intent", "change-definition", "impact-discovery", "risk-assessment", "test-strategy":
			row["disposition"] = "completed"
			row["evidence_refs"] = []interface{}{"tools/agentstream/checklist/tracker_test.go"}
		case "sub-adversarial-inquiry-pass":
			row["kind"] = "sub_procedure"
			row["disposition"] = "not_applicable"
			row["policy"] = "minimal-depth-no-inquiry"
			row["rationale"] = "Go writer fixture for minimal pre_implementation gate composition."
		default:
			row["disposition"] = "pending"
		}
		steps[i] = row
	}
	tracker["steps"] = steps
	if ee, ok := tracker["execution_evidence"].(map[string]interface{}); ok {
		ee["completed"] = deriveCompletedSlugs(steps)
	}
	tracker["depth_tier"] = "minimal"
	tracker["gate_policy"] = "advisory"
}
