// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: subprocess composition exercises sub-adversarial-inquiry-pass turn (A33).
package main

import (
	"bytes"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	checklistpkg "stdd/agentstream/checklist"
)

func TestTrackerComposition_inquirySubTurn(t *testing.T) {
	t.Helper()
	if _, err := exec.LookPath("ruby"); err != nil {
		t.Skipf("ruby not available: %v", err)
	}
	wd, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	moduleRoot, err := goModRootFrom(wd)
	if err != nil {
		t.Fatal(err)
	}
	t.Chdir(moduleRoot)

	checklist, err := filepath.Abs(filepath.Join(wd, "testdata", "inquiry-subturn-checklist.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	fakeAgent, err := filepath.Abs(filepath.Join(wd, "testdata", "fake_tracker_inquiry_agent.rb"))
	if err != nil {
		t.Fatal(err)
	}
	requestToken := "REQ-INQUIRY-COMPOSITION"
	ws := t.TempDir()
	trackerPath := filepath.Join(ws, "tracker.yaml")
	if err := writeInquiryCallerEvidence(ws); err != nil {
		t.Fatal(err)
	}
	if err := writeInquiryPhaseArtifacts(ws, requestToken, "pre_implementation"); err != nil {
		t.Fatal(err)
	}

	cmd := exec.Command(
		"go", "run", "./cmd/agentstream",
		"--workspace", ws,
		"--lead-checklist-yaml", checklist,
		"--checklist-tracker-yaml", trackerPath,
		"--lead-checklist-from-step", "inquiry-caller",
		"--lead-checklist-to-step", "inquiry-caller",
		"--checklist-var", "REQUEST="+requestToken,
		"--agent-path", fakeAgent,
		"--skip-tied-mcp-preflight",
	)
	cmd.Dir = moduleRoot
	cmd.Env = append(os.Environ(), "PWD="+moduleRoot)
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		t.Fatalf("agentstream run failed: %v\nstdout:\n%s\nstderr:\n%s", err, stdout.String(), stderr.String())
	}
	out := stdout.String()
	if !strings.Contains(out, "fake inquiry agent processed inquiry-caller") {
		t.Fatalf("missing inquiry-caller subprocess output:\n%s", out)
	}
	if !strings.Contains(out, "fake inquiry agent processed sub-adversarial-inquiry-pass") {
		t.Fatalf("missing inquiry sub-turn subprocess output:\n%s", out)
	}

	doc, err := checklistpkg.LoadTrackerYAML(trackerPath)
	if err != nil {
		t.Fatal(err)
	}
	if got := dispositionForSlug(doc, "sub-adversarial-inquiry-pass"); got != "completed" {
		t.Fatalf("sub-adversarial-inquiry-pass disposition: got %q want completed; tracker=%#v", got, doc)
	}
	if got := dispositionForSlug(doc, "inquiry-caller"); got != "completed" {
		t.Fatalf("inquiry-caller disposition: got %q want completed", got)
	}
}

func writeInquiryPhaseArtifacts(workspace, requestToken, phase string) error {
	dir := filepath.Join(workspace, "working", requestToken, "adversarial-inquiry", "phase-"+phase)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	files := map[string]interface{}{
		"obligation-report.json": map[string]interface{}{
			"schemaVersion":     "adversarial-inquiry-obligation.v1",
			"canonicalMutation": false,
			"findings":          []interface{}{},
		},
		"gate-result.json": map[string]interface{}{
			"schemaVersion":  "adversarial-inquiry-gate.v1",
			"status":         "pass",
			"verdict":        "PASS",
			"blocking":       false,
			"policy":         "advisory",
			"proofBoundary":  "human_decision",
			"diagnostics":    []interface{}{},
		},
		"evidence-provenance.json": map[string]interface{}{
			"schemaVersion": "adversarial-inquiry-provenance.v1",
			"provenance": map[string]interface{}{
				"mode":            "composition-fixture",
				"proofBoundaries": []string{"controlled_composition_fault"},
			},
		},
	}
	for name, body := range files {
		data, err := json.MarshalIndent(body, "", "  ")
		if err != nil {
			return err
		}
		if err := os.WriteFile(filepath.Join(dir, name), append(data, '\n'), 0o644); err != nil {
			return err
		}
	}
	ledgerPath := filepath.Join(dir, "finding-ledger.jsonl")
	return os.WriteFile(ledgerPath, []byte("{}\n"), 0o644)
}

func writeInquiryCallerEvidence(workspace string) error {
	path := filepath.Join(workspace, "evidence", "inquiry-caller.md")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return err
	}
	return os.WriteFile(path, []byte("composition evidence for inquiry-caller\n"), 0o644)
}
