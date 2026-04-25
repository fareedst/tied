package main

import (
	"bytes"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// REQ-GOAGENT-CHECKLIST-CONTROL validates that a live agentstream run recognizes
// a SPECIAL/control payload from the fake Ruby agent and processes the GOTO target next.
func TestAgentstreamRoutesRubyFakeAgentControlPayload(t *testing.T) {
	if _, err := exec.LookPath("ruby"); err != nil {
		t.Skipf("ruby not available for fake agent fixture: %v", err)
	}
	if _, err := exec.LookPath("go"); err != nil {
		t.Skipf("go toolchain not available for go run: %v", err)
	}

	// The Go module root is tools/agentstream/ (this package is at tools/agentstream/cmd/agentstream),
	// but test CWD can vary, so find go.mod by walking up from os.Getwd().
	wd, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	moduleRoot, err := goModRootFrom(wd)
	if err != nil {
		t.Fatal(err)
	}
	if st, err := os.Stat(filepath.Join(moduleRoot, "go.mod")); err != nil || st.IsDir() {
		t.Fatalf("module root does not look like a Go module (missing go.mod): %q (err=%v)", moduleRoot, err)
	}
	t.Chdir(moduleRoot)
	t.Setenv("PWD", moduleRoot)

	fixture, err := os.ReadFile(filepath.Join(wd, "testdata", "fake_agent.rb"))
	if err != nil {
		t.Fatal(err)
	}
	dir := t.TempDir()
	fakeAgent := filepath.Join(dir, "fake_agent.rb")
	if err := os.WriteFile(fakeAgent, fixture, 0o755); err != nil {
		t.Fatal(err)
	}
	checklist, err := filepath.Abs(filepath.Join(wd, "testdata", "control-checklist.yaml"))
	if err != nil {
		t.Fatal(err)
	}

	ws := t.TempDir()
	cmd := exec.Command(
		"go", "run", "./cmd/agentstream",
		"--workspace", ws,
		"--lead-checklist-yaml", checklist,
		"--lead-checklist-skip-sub",
		"--agent-path", fakeAgent,
		"--skip-tied-mcp-preflight",
	)
	cmd.Dir = moduleRoot
	cmd.Env = append(os.Environ(), "PWD="+moduleRoot)
	var stdout bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	if err := cmd.Run(); err != nil {
		t.Fatalf("agentstream run failed: %v\nstdout:\n%s\nstderr:\n%s", err, stdout.String(), stderr.String())
	}

	out := stdout.String()
	errText := stderr.String()
	// t.Fatalf("stdout:\n%s\nstderr:\n%s", out, errText)
	for _, want := range []string{"fake agent processed trigger-special", "fake agent processed rerouted-next"} {
		if !strings.Contains(out, want) {
			t.Fatalf("stdout missing %q\nstdout:\n%s\nstderr:\n%s", want, out, errText)
		}
	}
	if strings.Contains(out, "fake agent processed normal-next") || strings.Contains(errText, "[normal-next]") {
		t.Fatalf("normal-next should be skipped after control payload\nstdout:\n%s\nstderr:\n%s", out, errText)
	}
	if !strings.Contains(errText, "DIAGNOSTIC: agentstream_control goto rerouted-next") {
		t.Fatalf("stderr missing control routing diagnostic\nstdout:\n%s\nstderr:\n%s", out, errText)
	}
}

func goModRootFrom(start string) (string, error) {
	dir, err := filepath.Abs(start)
	if err != nil {
		return "", err
	}
	for i := 0; i < 32; i++ {
		if fi, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil && !fi.IsDir() {
			return dir, nil
		}
		next := filepath.Dir(dir)
		if next == dir {
			break
		}
		dir = next
	}
	return "", fmt.Errorf("go.mod not found by walking up from: %s", start)
}
