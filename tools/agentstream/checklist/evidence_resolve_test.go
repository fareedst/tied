package checklist

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: ResolveEvidenceRefs table cases for A16.
func TestResolveEvidenceRefs_filePathOk(t *testing.T) {
	dir := t.TempDir()
	evidence := filepath.Join(dir, "working", "REQ-TEST", "alpha.md")
	if err := os.MkdirAll(filepath.Dir(evidence), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(evidence, []byte("evidence body\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	receipt := CompletionReceipt{
		Disposition:  "completed",
		EvidenceRefs: []string{"working/REQ-TEST/alpha.md"},
	}
	resolved, err := ResolveEvidenceRefs(receipt, dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(resolved) != 1 {
		t.Fatalf("expected 1 resolved ref, got %#v", resolved)
	}
	if resolved[0].Kind != "file_path" {
		t.Fatalf("kind: %#v", resolved[0])
	}
	if !strings.HasPrefix(resolved[0].ArtifactHash, "sha256:") {
		t.Fatalf("hash: %#v", resolved[0].ArtifactHash)
	}
}

func TestResolveEvidenceRefs_missingFile(t *testing.T) {
	dir := t.TempDir()
	receipt := CompletionReceipt{
		Disposition:  "completed",
		EvidenceRefs: []string{"working/REQ-TEST/missing.md"},
	}
	_, err := ResolveEvidenceRefs(receipt, dir)
	if err == nil || !strings.Contains(err.Error(), "missing_artifact") {
		t.Fatalf("expected missing_artifact, got %v", err)
	}
}

func TestResolveEvidenceRefs_manifestOk(t *testing.T) {
	dir := t.TempDir()
	manifestSrc := filepath.Join("testdata", "verification-evidence-manifest-pass.json")
	data, err := os.ReadFile(manifestSrc)
	if err != nil {
		t.Fatal(err)
	}
	manifestPath := filepath.Join(dir, "working", "evidence", "manifest.json")
	if err := os.MkdirAll(filepath.Dir(manifestPath), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(manifestPath, data, 0o644); err != nil {
		t.Fatal(err)
	}
	receipt := CompletionReceipt{
		Disposition:  "completed",
		EvidenceRefs: []string{"working/evidence/manifest.json"},
	}
	resolved, err := ResolveEvidenceRefs(receipt, dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(resolved) != 1 || resolved[0].Kind != "manifest_ref" {
		t.Fatalf("unexpected resolved: %#v err=%v", resolved, err)
	}
}

func TestResolveEvidenceRefs_manifestNonzeroExit(t *testing.T) {
	dir := t.TempDir()
	body := []byte(`{"schema_version":"verification-evidence-manifest.v1","command_results":[{"id":"x","exit_code":1}]}`)
	manifestPath := filepath.Join(dir, "manifest.json")
	if err := os.WriteFile(manifestPath, body, 0o644); err != nil {
		t.Fatal(err)
	}
	receipt := CompletionReceipt{
		Disposition:  "completed",
		EvidenceRefs: []string{"manifest.json"},
	}
	_, err := ResolveEvidenceRefs(receipt, dir)
	if err == nil || !strings.Contains(err.Error(), "manifest_exit_nonzero") {
		t.Fatalf("expected manifest_exit_nonzero, got %v", err)
	}
}

func TestResolveEvidenceRefs_genericProseRejected(t *testing.T) {
	dir := t.TempDir()
	for _, ref := range []string{"tests passed", "build ok", "done", "success", "x"} {
		receipt := CompletionReceipt{
			Disposition:  "completed",
			EvidenceRefs: []string{ref},
		}
		_, err := ResolveEvidenceRefs(receipt, dir)
		if err == nil || !strings.Contains(err.Error(), "unresolved_evidence_ref") {
			t.Fatalf("ref %q: expected unresolved_evidence_ref, got %v", ref, err)
		}
	}
}

func TestApplyReceiptWithEvidenceResolution_blocksBeforeTrackerWrite(t *testing.T) {
	_, trackerPath := setupTrackerFixture(t)
	before, err := os.ReadFile(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	receipt := CompletionReceipt{
		SchemaVersion: 1,
		Slug:          "alpha",
		Disposition:   "completed",
		EvidenceRefs:  []string{"tests passed"},
	}
	err = ApplyReceiptWithEvidenceResolution(trackerPath, receipt, TurnIdentity{TurnIndex: 1, StepStub: "alpha"}, t.TempDir())
	if err == nil || !strings.Contains(err.Error(), "unresolved_evidence_ref") {
		t.Fatalf("expected unresolved_evidence_ref before write, got %v", err)
	}
	after, err := os.ReadFile(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	if string(before) != string(after) {
		t.Fatal("tracker mutated despite unresolved evidence ref")
	}
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: A32 inline command_evidence JSON refs resolve like validateCommandEvidence.
func TestResolveEvidenceRefs_CommandEvidence_inlineJsonOk(t *testing.T) {
	dir := t.TempDir()
	manifestBody := []byte(`{"schema_version":"verification-evidence-manifest.v1","command_results":[{"id":"go-test","exit_code":0}]}`)
	manifestPath := filepath.Join(dir, "working", "evidence", "manifest.json")
	outputPath := filepath.Join(dir, "working", "evidence", "stdout.txt")
	for _, p := range []string{manifestPath, outputPath} {
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.WriteFile(manifestPath, manifestBody, 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(outputPath, []byte("ok\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	ref := `{"claimed_success":true,"manifest_ref":"working/evidence/manifest.json","stdout_ref":"working/evidence/stdout.txt","exit_code":0}`
	receipt := CompletionReceipt{
		Disposition:  "completed",
		EvidenceRefs: []string{ref},
	}
	resolved, err := ResolveEvidenceRefs(receipt, dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(resolved) != 1 || resolved[0].Kind != "command_evidence" {
		t.Fatalf("unexpected resolved: %#v err=%v", resolved, err)
	}
	if !strings.HasPrefix(resolved[0].ArtifactHash, "sha256:") {
		t.Fatalf("hash: %#v", resolved[0].ArtifactHash)
	}
}

func TestResolveEvidenceRefs_CommandEvidence_prefixOk(t *testing.T) {
	dir := t.TempDir()
	manifestBody := []byte(`{"schema_version":"verification-evidence-manifest.v1","command_results":[{"id":"go-test","exit_code":0}]}`)
	manifestPath := filepath.Join(dir, "working", "evidence", "manifest.json")
	outputPath := filepath.Join(dir, "working", "evidence", "out.txt")
	for _, p := range []string{manifestPath, outputPath} {
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.WriteFile(manifestPath, manifestBody, 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(outputPath, []byte("output\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	ref := `command_evidence:{"claimed_success":true,"manifest_ref":"working/evidence/manifest.json","output_path":"working/evidence/out.txt","exit_code":0}`
	receipt := CompletionReceipt{
		Disposition:  "completed",
		EvidenceRefs: []string{ref},
	}
	resolved, err := ResolveEvidenceRefs(receipt, dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(resolved) != 1 || resolved[0].Kind != "command_evidence" {
		t.Fatalf("unexpected resolved: %#v", resolved)
	}
}

func TestResolveEvidenceRefs_CommandEvidence_successUnproven(t *testing.T) {
	dir := t.TempDir()
	ref := `{"claimed_success":true,"exit_code":0}`
	receipt := CompletionReceipt{
		Disposition:  "completed",
		EvidenceRefs: []string{ref},
	}
	_, err := ResolveEvidenceRefs(receipt, dir)
	if err == nil || !strings.Contains(err.Error(), "command_success_unproven") {
		t.Fatalf("expected command_success_unproven, got %v", err)
	}
}

func TestResolveEvidenceRefs_CommandEvidence_notClaimedSkipsStrictProof(t *testing.T) {
	dir := t.TempDir()
	ref := `{"claimed_success":false,"exit_code":1}`
	receipt := CompletionReceipt{
		Disposition:  "completed",
		EvidenceRefs: []string{ref},
	}
	resolved, err := ResolveEvidenceRefs(receipt, dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(resolved) != 1 || resolved[0].Kind != "command_evidence" {
		t.Fatalf("unexpected resolved: %#v", resolved)
	}
}
