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
