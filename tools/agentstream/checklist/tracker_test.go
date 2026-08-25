package checklist

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"gopkg.in/yaml.v3"
)

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: A1 materialization slug inventory and copy hygiene.
const trackerTestChecklistYAML = `
name: tracker_test_checklist
version: "0"
process_token: '[PROC-TEST]'
gate_contract:
  phases: [pre_implementation, verification, close_out]
  dispositions: [pending, completed, not_applicable, waived]
  required_artifacts: [obligation-report.json, finding-ledger.jsonl, gate-result.json, evidence-provenance.json]
  depth_selection_before_inquiry: true
  loop_back_invalidates_downstream_evidence: true
  fail_closed: true
steps:
  - slug: alpha
    title: First
    tasks: [a]
  - slug: beta
    title: Second
    tasks: [b]
sub_procedures:
  - slug: sub-adversarial-inquiry-pass
    title: Adversarial inquiry
    tasks: [inquiry]
`

func writeTrackerTestDefinition(t *testing.T, mutate func(string) string) string {
	t.Helper()
	body := strings.TrimLeft(trackerTestChecklistYAML, "\n")
	if mutate != nil {
		body = mutate(body)
	}
	dir := t.TempDir()
	p := filepath.Join(dir, "checklist.yaml")
	if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

func TestMaterializeAuthoritativeTracker_includesGateSubProcedure(t *testing.T) {
	def := writeTrackerTestDefinition(t, nil)
	trackerPath := filepath.Join(t.TempDir(), "tracker.yaml")
	if err := MaterializeAuthoritativeTracker(def, trackerPath, MaterializeOptions{RequestToken: "REQ-TEST"}); err != nil {
		t.Fatal(err)
	}
	doc, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	slugs := TrackerStepSlugs(doc)
	want := []string{"alpha", "beta", GateSubProcedureSlug}
	if len(slugs) != len(want) {
		t.Fatalf("slug inventory: got %v want %v", slugs, want)
	}
	for i, slug := range want {
		if slugs[i] != slug {
			t.Fatalf("slug order mismatch at %d: got %q want %q (all=%v)", i, slugs[i], slug, slugs)
		}
	}
	if !CopyHygieneClearsInheritedState(doc) {
		t.Fatal("expected clean pending materialization")
	}
}

func TestMaterializeAuthoritativeTracker_refusesDefinitionPath(t *testing.T) {
	def := writeTrackerTestDefinition(t, nil)
	err := MaterializeAuthoritativeTracker(def, def, MaterializeOptions{})
	if err == nil || !strings.Contains(err.Error(), "must not equal") {
		t.Fatalf("expected path refusal, got %v", err)
	}
}

func TestMaterializeAuthoritativeTracker_missingGateSubProcedure(t *testing.T) {
	def := writeTrackerTestDefinition(t, func(body string) string {
		return strings.Replace(body, "sub-adversarial-inquiry-pass", "sub-other", 1)
	})
	trackerPath := filepath.Join(t.TempDir(), "tracker.yaml")
	err := MaterializeAuthoritativeTracker(def, trackerPath, MaterializeOptions{})
	if err == nil || !strings.Contains(err.Error(), "missing_gate_sub_procedure") {
		t.Fatalf("expected missing gate sub error, got %v", err)
	}
}

func TestMaterializeAuthoritativeTracker_duplicateSlugFails(t *testing.T) {
	def := writeTrackerTestDefinition(t, func(body string) string {
		return body + "\n  - slug: alpha\n    title: Dup\n    tasks: [dup]\n"
	})
	// inject duplicate by rewriting steps section manually
	body, _ := os.ReadFile(def)
	duplicate := strings.Replace(string(body), "  - slug: beta", "  - slug: alpha\n    title: Dup\n    tasks: [dup]\n  - slug: beta", 1)
	_ = os.WriteFile(def, []byte(duplicate), 0o644)
	trackerPath := filepath.Join(t.TempDir(), "tracker.yaml")
	err := MaterializeAuthoritativeTracker(def, trackerPath, MaterializeOptions{})
	if err == nil || !strings.Contains(err.Error(), "duplicate") {
		t.Fatalf("expected duplicate slug error, got %v", err)
	}
}

func TestEnsureTracker_materializesWhenMissing(t *testing.T) {
	def := writeTrackerTestDefinition(t, nil)
	trackerPath := filepath.Join(t.TempDir(), "nested", "tracker.yaml")
	if err := EnsureTracker(def, trackerPath, "REQ-ENSURE"); err != nil {
		t.Fatal(err)
	}
	if _, err := os.Stat(trackerPath); err != nil {
		t.Fatalf("tracker not created: %v", err)
	}
}

func TestValidateTrackerIdentity_sourceMismatch(t *testing.T) {
	def := writeTrackerTestDefinition(t, nil)
	trackerPath := filepath.Join(t.TempDir(), "tracker.yaml")
	if err := MaterializeAuthoritativeTracker(def, trackerPath, MaterializeOptions{RequestToken: "REQ-A"}); err != nil {
		t.Fatal(err)
	}
	doc, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	doc["source_document"] = "/other/checklist.yaml"
	if err := ValidateTrackerIdentity(doc, def, "REQ-A"); err == nil {
		t.Fatal("expected source mismatch error")
	}
}

func TestCanonicalChecklistMaterialization_A1(t *testing.T) {
	root, ok := FindRepoRootForTest(t)
	if !ok {
		t.Skip("repo root checklist not found")
	}
	def := filepath.Join(root, "tied", "docs", "agent-req-implementation-checklist.yaml")
	trackerPath := filepath.Join(t.TempDir(), "authoritative-tracker.yaml")
	if err := MaterializeAuthoritativeTracker(def, trackerPath, MaterializeOptions{RequestToken: "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT"}); err != nil {
		t.Fatal(err)
	}
	doc, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	slugs := TrackerStepSlugs(doc)
	hasSub := false
	for _, slug := range slugs {
		if slug == GateSubProcedureSlug {
			hasSub = true
		}
	}
	if !hasSub {
		t.Fatalf("missing %q in materialized tracker (%d slugs)", GateSubProcedureSlug, len(slugs))
	}
	if len(slugs) < 20 {
		t.Fatalf("expected non-sparse tracker with many main slugs, got %d", len(slugs))
	}
}

func FindRepoRootForTest(t *testing.T) (string, bool) {
	t.Helper()
	wd, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	dir := wd
	for i := 0; i < 12; i++ {
		p := filepath.Join(dir, "tied", "docs", "agent-req-implementation-checklist.yaml")
		if st, err := os.Stat(p); err == nil && !st.IsDir() {
			return dir, true
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return "", false
}

func TestLegacyImportPreservesUnrelatedFields(t *testing.T) {
	def := writeTrackerTestDefinition(t, nil)
	trackerPath := filepath.Join(t.TempDir(), "tracker.yaml")
	extra := map[string]interface{}{
		"schema_version":  TrackerSchemaVersion,
		"source_document": def,
		"scope":           "legacy-copy",
		"steps": []interface{}{
			map[string]interface{}{"slug": "alpha", "kind": "main", "disposition": "pending"},
		},
	}
	body, _ := yaml.Marshal(extra)
	if err := os.WriteFile(trackerPath, body, 0o644); err != nil {
		t.Fatal(err)
	}
	receipt := CompletionReceipt{
		SchemaVersion: 1,
		Slug:          "alpha",
		Disposition:   "completed",
		EvidenceRefs:  []string{"working/REQ-X/alpha.md"},
	}
	if err := ApplyTrackerDisposition(trackerPath, receipt, TurnIdentity{TurnIndex: 1, StepStub: "alpha"}); err != nil {
		t.Fatal(err)
	}
	doc, err := LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	if doc["scope"] != "legacy-copy" {
		t.Fatalf("unrelated scope field lost: %#v", doc["scope"])
	}
}
