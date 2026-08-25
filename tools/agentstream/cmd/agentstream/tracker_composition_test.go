// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: process composition proves receipt gating before turn N+1.
package main

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

func TestAgentstreamRequiresTrackerReceiptBeforeNextTurn(t *testing.T) {
	runTrackerComposition(t, false, true)
}

func TestAgentstreamMissingTrackerReceiptExitsBeforeNextTurn(t *testing.T) {
	runTrackerComposition(t, true, false)
}

func runTrackerComposition(t *testing.T, omitReceipt, wantStepTwo bool) {
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

	checklist, err := filepath.Abs(filepath.Join(wd, "testdata", "tracker-checklist.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	fakeAgent, err := filepath.Abs(filepath.Join(wd, "testdata", "fake_tracker_agent.rb"))
	if err != nil {
		t.Fatal(err)
	}
	ws := t.TempDir()
	trackerPath := filepath.Join(ws, "tracker.yaml")
	if err := writeCompositionEvidenceFiles(ws); err != nil {
		t.Fatal(err)
	}
	defBefore, err := os.ReadFile(checklist)
	if err != nil {
		t.Fatal(err)
	}

	cmd := exec.Command(
		"go", "run", "./cmd/agentstream",
		"--workspace", ws,
		"--lead-checklist-yaml", checklist,
		"--checklist-tracker-yaml", trackerPath,
		"--lead-checklist-skip-sub",
		"--checklist-var", "REQUEST=REQ-TRACKER-COMPOSITION",
		"--agent-path", fakeAgent,
		"--skip-tied-mcp-preflight",
	)
	cmd.Dir = moduleRoot
	cmd.Env = append(os.Environ(), "PWD="+moduleRoot)
	if omitReceipt {
		cmd.Env = append(cmd.Env, "OMIT_TRACKER_RECEIPT=1")
	}
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	runErr := cmd.Run()

	defAfter, err := os.ReadFile(checklist)
	if err != nil {
		t.Fatal(err)
	}
	if string(defBefore) != string(defAfter) {
		t.Fatal("canonical checklist bytes changed during tracker run")
	}

	out := stdout.String()
	errText := stderr.String()
	if omitReceipt {
		if runErr == nil {
			t.Fatalf("expected non-zero exit without receipt\nstdout:\n%s\nstderr:\n%s", out, errText)
		}
		if strings.Contains(out, "fake tracker agent processed step-two") {
			t.Fatalf("turn N+1 ran without valid receipt\nstdout:\n%s\nstderr:\n%s", out, errText)
		}
		return
	}
	if runErr != nil {
		t.Fatalf("agentstream run failed: %v\nstdout:\n%s\nstderr:\n%s", runErr, out, errText)
	}
	if !strings.Contains(out, "fake tracker agent processed step-one") {
		t.Fatalf("missing step-one output\nstdout:\n%s", out)
	}
	if wantStepTwo && !strings.Contains(out, "fake tracker agent processed step-two") {
		t.Fatalf("missing step-two sentinel\nstdout:\n%s\nstderr:\n%s", out, errText)
	}
	if _, err := os.Stat(trackerPath); err != nil {
		t.Fatalf("tracker not written: %v", err)
	}
}

func TestAgentstreamCanonicalChecklistUnchangedWithTracker(t *testing.T) {
	TestAgentstreamRequiresTrackerReceiptBeforeNextTurn(t)
}

func TestAgentstreamInstructionRenderedLedgerBeforeSubprocess(t *testing.T) {
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

	checklist, err := filepath.Abs(filepath.Join(wd, "testdata", "tracker-checklist.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	fakeAgent, err := filepath.Abs(filepath.Join(wd, "testdata", "fake_tracker_agent.rb"))
	if err != nil {
		t.Fatal(err)
	}
	ws := t.TempDir()
	trackerPath := filepath.Join(ws, "tracker.yaml")
	ledgerPath := filepath.Join(ws, "adherence", "events.jsonl")
	if err := writeCompositionEvidenceFiles(ws); err != nil {
		t.Fatal(err)
	}

	cmd := exec.Command(
		"go", "run", "./cmd/agentstream",
		"--workspace", ws,
		"--lead-checklist-yaml", checklist,
		"--checklist-tracker-yaml", trackerPath,
		"--adherence-ledger", ledgerPath,
		"--lead-checklist-skip-sub",
		"--checklist-var", "REQUEST=REQ-TRACKER-COMPOSITION",
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
	data, err := os.ReadFile(ledgerPath)
	if err != nil {
		t.Fatalf("ledger missing: %v", err)
	}
	text := string(data)
	if !strings.Contains(text, `"event_class":"instruction_rendered"`) && !strings.Contains(text, `"event_class": "instruction_rendered"`) {
		t.Fatalf("missing instruction_rendered row:\n%s", text)
	}
	firstLine := strings.Split(strings.TrimSpace(text), "\n")[0]
	if !strings.Contains(firstLine, "instruction_rendered") {
		t.Fatalf("first row should be instruction_rendered, got: %s", firstLine)
	}
	if strings.Contains(text, "fake tracker agent processed") {
		t.Fatalf("ledger must not contain prompt/response bodies")
	}
}

func TestAgentstreamOutcomeVerifiedLedgerAfterEvidenceResolution(t *testing.T) {
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

	checklist, err := filepath.Abs(filepath.Join(wd, "testdata", "tracker-checklist.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	fakeAgent, err := filepath.Abs(filepath.Join(wd, "testdata", "fake_tracker_agent.rb"))
	if err != nil {
		t.Fatal(err)
	}
	ws := t.TempDir()
	trackerPath := filepath.Join(ws, "tracker.yaml")
	ledgerPath := filepath.Join(ws, "adherence", "events.jsonl")
	if err := writeCompositionEvidenceFiles(ws); err != nil {
		t.Fatal(err)
	}

	cmd := exec.Command(
		"go", "run", "./cmd/agentstream",
		"--workspace", ws,
		"--lead-checklist-yaml", checklist,
		"--checklist-tracker-yaml", trackerPath,
		"--adherence-ledger", ledgerPath,
		"--lead-checklist-skip-sub",
		"--checklist-var", "REQUEST=REQ-TRACKER-COMPOSITION",
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
	data, err := os.ReadFile(ledgerPath)
	if err != nil {
		t.Fatalf("ledger missing: %v", err)
	}
	text := string(data)
	if !strings.Contains(text, "outcome_verified") {
		t.Fatalf("missing outcome_verified row:\n%s", text)
	}
	if !strings.Contains(text, "artifact_hash") || !strings.Contains(text, "ref_kind") {
		t.Fatalf("missing outcome_verified artifact fields:\n%s", text)
	}
}

func writeCompositionEvidenceFiles(workspace string) error {
	for _, step := range []string{"step-one", "step-two"} {
		path := filepath.Join(workspace, "evidence", step+".md")
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			return err
		}
		body := []byte("composition evidence for " + step + "\n")
		if err := os.WriteFile(path, body, 0o644); err != nil {
			return err
		}
	}
	return nil
}
