package stdd_hello_world_smoke_test

import (
	"bytes"
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"testing"

	smoke "stdd_hello_world_smoke"
)

func moduleRoot(t *testing.T) string {
	t.Helper()
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	return filepath.Dir(file)
}

// bashScriptOutput runs bash with script basename in dir; fatals with stderr on failure.
// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
// How: Delegates to BashScriptStdout; UNIT_TEST success path; non-zero-exit tests use exec.Command directly.
func bashScriptOutput(t *testing.T, dir, basename string) []byte {
	t.Helper()
	out, err := smoke.BashScriptStdout(dir, basename)
	if err != nil {
		var ee *exec.ExitError
		stderr := ""
		if errors.As(err, &ee) {
			stderr = string(ee.Stderr)
		}
		t.Fatalf("bash %s in %s: %v stderr=%q", basename, dir, err, stderr)
	}
	return out
}

// resolveHelloScriptBasename wraps smoke.ResolveHelloScriptBasename for success-path tests.
// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
// How: Fatals if RESOLVE would return error (UNIT_TEST precondition).
func resolveHelloScriptBasename(t *testing.T, root string) string {
	t.Helper()
	name, err := smoke.ResolveHelloScriptBasename(root)
	if err != nil {
		t.Fatal(err)
	}
	return name
}

// Test group: SCRIPT_ENTRY OUTPUT contract — procedure SCRIPT_ENTRY (essence_pseudocode OUTPUT line).
func TestSCRIPT_ENTRY_OUTPUT_exactly_one_line_REQ_GOAGENT_BASH_HELLO_SCRIPT(t *testing.T) {
	// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
	// Validates OUTPUT: stdout is exactly one line "Hello World!" with trailing newline; extra lines violate the contract.
	t.Helper()
	root := t.TempDir()
	script := filepath.Join(root, smoke.HelloWorldBasename)
	body := "#!/usr/bin/env bash\nset -euo pipefail\nprintf '%s\\n' 'Hello World!'\necho 'extra-line'\n"
	if err := os.WriteFile(script, []byte(body), 0o755); err != nil {
		t.Fatal(err)
	}
	out := bashScriptOutput(t, root, smoke.HelloWorldBasename)
	if bytes.Count(out, []byte{'\n'}) < 2 {
		t.Fatalf("fixture sanity: want multiline stdout, got %q", out)
	}
	if err := smoke.AssertScriptEntryStdoutContract(out); err == nil {
		t.Fatal("expected contract violation for multiline stdout")
	}
}

// Test group: SCRIPT_ENTRY — REQ-GOAGENT-BASH-HELLO-SCRIPT (maps to IMPL essence_pseudocode procedures RESOLVE_HELLO_SCRIPT_BASENAME and UNIT_TEST_SCRIPT_ENTRY).
func TestSCRIPT_ENTRY_REQ_GOAGENT_BASH_HELLO_SCRIPT_stdout_and_exit(t *testing.T) {
	// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
	// Validates OUTPUT per essence_pseudocode via AssertScriptEntryStdoutContract; exit status 0 on success.
	t.Helper()
	root := moduleRoot(t)
	basename := resolveHelloScriptBasename(t, root)
	out := bashScriptOutput(t, root, basename)
	if err := smoke.AssertScriptEntryStdoutContract(out); err != nil {
		t.Fatal(err)
	}
}

// Covers RESOLVE failure path: RETURN error when neither candidate exists (essence_pseudocode RESOLVE_HELLO_SCRIPT_BASENAME).
func TestRESOLVE_HELLO_SCRIPT_BASENAME_missing_REQ_GOAGENT_BASH_HELLO_SCRIPT(t *testing.T) {
	// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
	// Validates: RESOLVE_HELLO_SCRIPT_BASENAME returns error when no candidate script exists.
	t.Helper()
	root := t.TempDir()
	_, err := smoke.ResolveHelloScriptBasename(root)
	if err == nil {
		t.Fatal("want error when no hello_world.sh or hello.sh in directory")
	}
}

// Covers UNIT_TEST ON process error / non-zero exit (essence_pseudocode UNIT_TEST_SCRIPT_ENTRY fallible path).
func TestUNIT_TEST_SCRIPT_ENTRY_bash_nonzero_REQ_GOAGENT_BASH_HELLO_SCRIPT(t *testing.T) {
	// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
	// Validates: ON process error / non-zero exit — expect *exec.ExitError with exit code 7.
	t.Helper()
	root := t.TempDir()
	script := filepath.Join(root, smoke.HelloWorldBasename)
	if err := os.WriteFile(script, []byte("#!/usr/bin/env bash\nset -euo pipefail\nexit 7\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	cmd := exec.Command("bash", smoke.HelloWorldBasename)
	cmd.Dir = root
	_, err := cmd.Output()
	if err == nil {
		t.Fatal("want non-nil error when script exits 7")
	}
	var ee *exec.ExitError
	if !errors.As(err, &ee) {
		t.Fatalf("want *exec.ExitError, got %T: %v", err, err)
	}
	if code := ee.ExitCode(); code != 7 {
		t.Fatalf("exit code: want 7 got %d", code)
	}
}

// Test group: COMPOSE_SCRIPT_ENTRY_SMOKE_FROM_ROOT — Phase G composition (no UI).
func TestCOMPOSE_RunScriptEntrySmokeFromRoot_REQ_GOAGENT_BASH_HELLO_SCRIPT(t *testing.T) {
	// [IMPL-GOAGENT-BASH-HELLO-SCRIPT] [ARCH-GOAGENT-BASH-HELLO-SCRIPT] [REQ-GOAGENT-BASH-HELLO-SCRIPT]
	// Validates composition binding: ResolveHelloScriptBasename -> BashScriptStdout -> AssertScriptEntryStdoutContract (procedure COMPOSE_SCRIPT_ENTRY_SMOKE_FROM_ROOT).
	t.Helper()
	if err := smoke.RunScriptEntrySmokeFromRoot(moduleRoot(t)); err != nil {
		t.Fatal(err)
	}
}
