package checklist

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: atomic writer and loop-back invalidation tests.
func setupTrackerFixture(t *testing.T) (defPath, trackerPath string) {
	t.Helper()
	defPath = writeTrackerTestDefinition(t, func(body string) string {
		return body + `
loop_back_clearance:
  alpha:
    clear_slugs:
      - beta
`
	})
	trackerPath = filepath.Join(t.TempDir(), "tracker.yaml")
	if err := MaterializeAuthoritativeTracker(defPath, trackerPath, MaterializeOptions{RequestToken: "REQ-TEST"}); err != nil {
		t.Fatal(err)
	}
	return defPath, trackerPath
}

func TestApplyTrackerDisposition_singleStepChange(t *testing.T) {
	_, trackerPath := setupTrackerFixture(t)
	before, _ := os.ReadFile(trackerPath)
	receipt := CompletionReceipt{
		SchemaVersion: 1,
		Slug:          "alpha",
		Disposition:   "completed",
		EvidenceRefs:  []string{"working/REQ-TEST/alpha.md"},
	}
	id := TurnIdentity{TurnIndex: 1, StepStub: "alpha", SessionID: "sess-1"}
	if err := ApplyTrackerDisposition(trackerPath, receipt, id); err != nil {
		t.Fatal(err)
	}
	doc, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	steps := doc["steps"].([]interface{})
	alpha := steps[0].(map[string]interface{})
	if alpha["disposition"] != "completed" {
		t.Fatalf("alpha disposition not updated: %#v", alpha)
	}
	beta := steps[1].(map[string]interface{})
	if beta["disposition"] != "pending" {
		t.Fatalf("beta should remain pending: %#v", beta)
	}
	completed := DerivedCompletedFromTracker(doc)
	if len(completed) != 1 || completed[0] != "alpha" {
		t.Fatalf("derived completed wrong: %#v", completed)
	}
	_ = before
}

func TestApplyTrackerDisposition_idempotentReplay(t *testing.T) {
	_, trackerPath := setupTrackerFixture(t)
	receipt := CompletionReceipt{
		SchemaVersion: 1,
		Slug:          "alpha",
		Disposition:   "completed",
		EvidenceRefs:  []string{"working/REQ-TEST/alpha.md"},
	}
	id := TurnIdentity{TurnIndex: 1, StepStub: "alpha", SessionID: "sess-1"}
	if err := ApplyTrackerDisposition(trackerPath, receipt, id); err != nil {
		t.Fatal(err)
	}
	afterFirst, _ := os.ReadFile(trackerPath)
	if err := ApplyTrackerDisposition(trackerPath, receipt, id); err != nil {
		t.Fatal(err)
	}
	afterSecond, _ := os.ReadFile(trackerPath)
	if string(afterFirst) != string(afterSecond) {
		t.Fatal("idempotent replay changed tracker bytes")
	}
}

func TestApplyTrackerDisposition_conflictingReplay(t *testing.T) {
	_, trackerPath := setupTrackerFixture(t)
	receipt := CompletionReceipt{
		SchemaVersion: 1,
		Slug:          "alpha",
		Disposition:   "completed",
		EvidenceRefs:  []string{"working/REQ-TEST/alpha.md"},
	}
	id := TurnIdentity{TurnIndex: 1, StepStub: "alpha", SessionID: "sess-1"}
	if err := ApplyTrackerDisposition(trackerPath, receipt, id); err != nil {
		t.Fatal(err)
	}
	conflict := receipt
	conflict.EvidenceRefs = []string{"working/REQ-TEST/other.md"}
	err := ApplyTrackerDisposition(trackerPath, conflict, id)
	if err == nil || !strings.Contains(err.Error(), "conflicting_replay") {
		t.Fatalf("expected conflicting_replay, got %v", err)
	}
}

func TestApplyTrackerDisposition_failureLeavesFileUnchanged(t *testing.T) {
	_, trackerPath := setupTrackerFixture(t)
	before, _ := os.ReadFile(trackerPath)
	receipt := CompletionReceipt{
		SchemaVersion: 1,
		Slug:          "missing-slug",
		Disposition:   "completed",
		EvidenceRefs:  []string{"x"},
	}
	err := ApplyTrackerDisposition(trackerPath, receipt, TurnIdentity{TurnIndex: 1, StepStub: "missing-slug"})
	if err == nil {
		t.Fatal("expected step_not_found")
	}
	after, _ := os.ReadFile(trackerPath)
	if string(before) != string(after) {
		t.Fatal("failed apply mutated tracker file")
	}
}

func TestInvalidateTrackerDownstream_clearsConfiguredSlugs(t *testing.T) {
	defPath, trackerPath := setupTrackerFixture(t)
	// complete alpha and beta first
	for _, slug := range []string{"alpha", "beta"} {
		receipt := CompletionReceipt{
			SchemaVersion: 1,
			Slug:          slug,
			Disposition:   "completed",
			EvidenceRefs:  []string{"working/REQ-TEST/" + slug + ".md"},
		}
		if err := ApplyTrackerDisposition(trackerPath, receipt, TurnIdentity{TurnIndex: 1, StepStub: slug}); err != nil {
			t.Fatal(err)
		}
	}
	cleared, err := InvalidateTrackerDownstream(trackerPath, defPath, "alpha")
	if err != nil {
		t.Fatal(err)
	}
	if len(cleared) != 1 || cleared[0] != "beta" {
		t.Fatalf("unexpected cleared slugs: %#v", cleared)
	}
	doc, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	steps := doc["steps"].([]interface{})
	beta := steps[1].(map[string]interface{})
	if beta["disposition"] != "pending" {
		t.Fatalf("beta not reset: %#v", beta)
	}
	completed := DerivedCompletedFromTracker(doc)
	if len(completed) != 1 || completed[0] != "alpha" {
		t.Fatalf("derived completed after invalidation: %#v", completed)
	}
}

func TestExecutionEvidenceCompletedIsDerivedOnly(t *testing.T) {
	_, trackerPath := setupTrackerFixture(t)
	doc, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	ee := doc["execution_evidence"].(map[string]interface{})
	ee["completed"] = []interface{}{"alpha", "beta"}
	if !ExecutionEvidenceCompletedOverride(doc, []string{"alpha", "beta"}) {
		t.Fatal("override without step dispositions should be detectable")
	}
	receipt := CompletionReceipt{
		SchemaVersion: 1,
		Slug:          "alpha",
		Disposition:   "completed",
		EvidenceRefs:  []string{"working/REQ-TEST/alpha.md"},
	}
	if err := ApplyTrackerDisposition(trackerPath, receipt, TurnIdentity{TurnIndex: 1, StepStub: "alpha"}); err != nil {
		t.Fatal(err)
	}
	doc, _ = LoadTrackerYAML(trackerPath)
	ee = doc["execution_evidence"].(map[string]interface{})
	completed := ee["completed"].([]interface{})
	if len(completed) != 1 {
		t.Fatalf("derived completed should reflect one completed step, got %#v", completed)
	}
}

func TestAtomicWriteFailureLeavesOriginal(t *testing.T) {
	_, trackerPath := setupTrackerFixture(t)
	before, _ := os.ReadFile(trackerPath)
	dir := filepath.Dir(trackerPath)
	if err := os.Chmod(dir, 0o555); err != nil {
		t.Skip("cannot chmod dir for write failure test")
	}
	t.Cleanup(func() { _ = os.Chmod(dir, 0o755) })
	receipt := CompletionReceipt{
		SchemaVersion: 1,
		Slug:          "alpha",
		Disposition:   "completed",
		EvidenceRefs:  []string{"working/REQ-TEST/alpha.md"},
	}
	err := ApplyTrackerDisposition(trackerPath, receipt, TurnIdentity{TurnIndex: 1, StepStub: "alpha"})
	if err == nil {
		t.Fatal("expected write failure")
	}
	after, _ := os.ReadFile(trackerPath)
	if string(before) != string(after) {
		t.Fatal("write failure changed tracker")
	}
}
