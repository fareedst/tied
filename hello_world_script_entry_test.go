package stdd_hello_world_smoke_test

import (
	"os/exec"
	"path/filepath"
	"runtime"
	"testing"
)

func moduleRoot(t *testing.T) string {
	t.Helper()
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	return filepath.Dir(file)
}

// Test group: SCRIPT_ENTRY — REQ-GOAGENT-BASH-HELLO-SCRIPT (maps to IMPL essence_pseudocode procedure SCRIPT_ENTRY).
func TestSCRIPT_ENTRY_REQ_GOAGENT_BASH_HELLO_SCRIPT_stdout_and_exit(t *testing.T) {
	// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
	// Validates SCRIPT_ENTRY OUTPUT per essence_pseudocode: stdout exactly "Hello World!" plus one newline; exit status 0 on success.
	t.Helper()
	cmd := exec.Command("bash", "hello_world.sh")
	cmd.Dir = moduleRoot(t)
	out, err := cmd.Output()
	if err != nil {
		t.Fatalf("Run: %v", err)
	}
	want := "Hello World!\n"
	if string(out) != want {
		t.Fatalf("stdout: want %q got %q", want, out)
	}
}
