package checklist

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"stdd/agentstream/config"
)

// [IMPL-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE] — How: dual-write parity agentstream CLI vs direct patch contract (RISK-002).
func TestDualWriteEnvelopePatch_agentstreamMatchesDirectPatch(t *testing.T) {
	repoRoot, ok := config.FindRepoRoot(".")
	if !ok {
		t.Skip("repo root not found")
	}
	cliPath := filepath.Join(repoRoot, envelopePatchCLIRel)
	if _, err := os.Stat(cliPath); err != nil {
		t.Skipf("envelope patch CLI not built: %v", err)
	}

	t.Setenv("TIED_ENVELOPE_HOOKS", "1")
	dir := t.TempDir()
	requestToken := "REQ-DUAL-WRITE-TEST"
	trackerRel := filepath.Join("working", requestToken, "agent-req-implementation-checklist.yaml")
	trackerPath := filepath.Join(dir, trackerRel)
	if err := os.MkdirAll(filepath.Dir(trackerPath), 0o755); err != nil {
		t.Fatal(err)
	}
	trackerBody := []byte("execution_evidence:\n  request: REQ-DUAL-WRITE-TEST\nsteps: []\n")
	if err := os.WriteFile(trackerPath, trackerBody, 0o644); err != nil {
		t.Fatal(err)
	}
	tiedBase := filepath.Join(repoRoot, "tied")

	payload := map[string]interface{}{
		"request_token":            requestToken,
		"project_root":             dir,
		"tied_base_path":           tiedBase,
		"confirmed_tied_base_path": tiedBase,
		"generated_at":             "2026-09-10T18:00:00.000Z",
		"artifact": map[string]interface{}{
			"kind":             "checklist_tracker",
			"path":             filepath.ToSlash(trackerRel),
			"content_hash":     fileContentHash(trackerBody),
			"phase":            nil,
			"schema_version":   nil,
			"status":           "present",
			"proof_boundaries": []string{"tracker_disposition_only"},
		},
	}

	first, err := InvokeEnvelopePatchCLI(dir, payload)
	if err != nil {
		t.Fatalf("first patch: %v", err)
	}
	envelopePath := filepath.Join(dir, "working", requestToken, "evidence", "request-evidence-envelope.v1.json")
	firstBytes, err := os.ReadFile(envelopePath)
	if err != nil {
		t.Fatal(err)
	}

	os.Remove(envelopePath)
	second, err := InvokeEnvelopePatchCLI(dir, payload)
	if err != nil {
		t.Fatalf("second patch: %v", err)
	}
	secondBytes, err := os.ReadFile(envelopePath)
	if err != nil {
		t.Fatal(err)
	}
	if string(firstBytes) != string(secondBytes) {
		t.Fatalf("dual-write mismatch:\nfirst=%s\nsecond=%s", firstBytes, secondBytes)
	}
	if first.Revision != second.Revision {
		t.Fatalf("revision mismatch: %d vs %d", first.Revision, second.Revision)
	}
}

func TestTryPatchTrackerEnvelope_afterApplyTrackerDisposition(t *testing.T) {
	repoRoot, ok := config.FindRepoRoot(".")
	if !ok {
		t.Skip("repo root not found")
	}
	if _, err := os.Stat(filepath.Join(repoRoot, envelopePatchCLIRel)); err != nil {
		t.Skipf("envelope patch CLI not built: %v", err)
	}

	t.Setenv("TIED_ENVELOPE_HOOKS", "1")
	dir := t.TempDir()
	defPath := writeTrackerTestDefinition(t, func(body string) string { return body })
	trackerPath := filepath.Join(dir, "working", "REQ-TEST", "agent-req-implementation-checklist.yaml")
	if err := MaterializeAuthoritativeTracker(defPath, trackerPath, MaterializeOptions{RequestToken: "REQ-TEST"}); err != nil {
		t.Fatal(err)
	}
	evidencePath := filepath.Join(dir, "working", "REQ-TEST", "alpha.md")
	if err := os.MkdirAll(filepath.Dir(evidencePath), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(evidencePath, []byte("alpha evidence\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	receipt := CompletionReceipt{
		SchemaVersion: 1,
		Slug:          "alpha",
		Disposition:   "completed",
		EvidenceRefs:  []EvidenceRef{EvidenceRefFromString("working/REQ-TEST/alpha.md")},
	}
	identity := TurnIdentity{TurnIndex: 1, StepStub: "alpha"}
	if err := ApplyTrackerDisposition(trackerPath, receipt, identity); err != nil {
		t.Fatal(err)
	}
	TryPatchTrackerEnvelope(PatchTrackerEnvelopeInput{
		ProjectRoot:  dir,
		RequestToken: "REQ-TEST",
		TrackerPath:  trackerPath,
		TiedBasePath: filepath.Join(repoRoot, "tied"),
	})

	envelopePath := filepath.Join(dir, "working", "REQ-TEST", "evidence", "request-evidence-envelope.v1.json")
	data, err := os.ReadFile(envelopePath)
	if err != nil {
		t.Fatal(err)
	}
	var envelope map[string]interface{}
	if err := json.Unmarshal(data, &envelope); err != nil {
		t.Fatal(err)
	}
	artifacts, ok := envelope["artifacts"].([]interface{})
	if !ok || len(artifacts) == 0 {
		t.Fatalf("expected checklist_tracker artifact, got %#v", envelope)
	}
	first, ok := artifacts[0].(map[string]interface{})
	if !ok || first["kind"] != "checklist_tracker" {
		t.Fatalf("unexpected artifact: %#v", artifacts[0])
	}
}

func TestResolveEvidenceRefs_envelopeRefTyped(t *testing.T) {
	dir := t.TempDir()
	envelopeRel := filepath.Join("working", "REQ-TEST", "evidence", "request-evidence-envelope.v1.json")
	envelopePath := filepath.Join(dir, envelopeRel)
	if err := os.MkdirAll(filepath.Dir(envelopePath), 0o755); err != nil {
		t.Fatal(err)
	}
	body := []byte(`{"schema_version":"request-evidence-envelope.v1","envelope_meta":{"revision":1},"artifacts":[]}`)
	if err := os.WriteFile(envelopePath, body, 0o644); err != nil {
		t.Fatal(err)
	}
	refBody, err := json.Marshal(map[string]string{
		"kind": "envelope_ref",
		"path": filepath.ToSlash(envelopeRel),
	})
	if err != nil {
		t.Fatal(err)
	}
	receipt := CompletionReceipt{
		Disposition:  "completed",
		EvidenceRefs: []EvidenceRef{{raw: refBody}},
	}
	resolved, err := ResolveEvidenceRefs(receipt, dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(resolved) != 1 || resolved[0].Kind != "envelope_ref" {
		t.Fatalf("unexpected resolved: %#v err=%v", resolved, err)
	}
	if !strings.HasPrefix(resolved[0].ArtifactHash, "sha256:") {
		t.Fatalf("hash: %#v", resolved[0].ArtifactHash)
	}
}

func TestResolveEvidenceRefs_gateReceiptTyped(t *testing.T) {
	dir := t.TempDir()
	gateRel := filepath.Join("working", "REQ-TEST", "gates", "verification.json")
	gatePath := filepath.Join(dir, gateRel)
	if err := os.MkdirAll(filepath.Dir(gatePath), 0o755); err != nil {
		t.Fatal(err)
	}
	body := []byte(`{"schema_version":"checklist-gate-receipt.v1","allowed":true}`)
	if err := os.WriteFile(gatePath, body, 0o644); err != nil {
		t.Fatal(err)
	}
	refBody, err := json.Marshal(map[string]string{
		"kind": "gate_receipt",
		"path": filepath.ToSlash(gateRel),
	})
	if err != nil {
		t.Fatal(err)
	}
	receipt := CompletionReceipt{
		Disposition:  "completed",
		EvidenceRefs: []EvidenceRef{{raw: refBody}},
	}
	resolved, err := ResolveEvidenceRefs(receipt, dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(resolved) != 1 || resolved[0].Kind != "gate_receipt" {
		t.Fatalf("unexpected resolved: %#v", resolved)
	}
}
