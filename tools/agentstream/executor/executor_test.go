package executor

import (
	"bytes"
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// [IMPL-GOAGENT-EXECUTOR] [ARCH-GOAGENT-EXECUTOR] [REQ-GOAGENT-AGENT-EXECUTOR]
// How: Run captures assistant text fragments and session_id from stream-json stdout.
func TestRunCapturesAssistantText(t *testing.T) {
	dir := t.TempDir()
	agent := filepath.Join(dir, "agent-stub.sh")
	script := `#!/bin/sh
printf '%s\n' '{"session_id":"s-1","type":"assistant","message":{"content":[{"type":"text","text":"hello "},{"type":"text","text":"world"}]}}'
`
	if err := os.WriteFile(agent, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	var out bytes.Buffer
	var errOut bytes.Buffer
	result, code, err := Run(context.Background(), []string{agent}, &out, &errOut)
	if err != nil {
		t.Fatal(err)
	}
	if code != 0 || result.SessionID != "s-1" {
		t.Fatalf("code/sid mismatch: code=%d sid=%q stderr=%s", code, result.SessionID, errOut.String())
	}
	if result.FinalText != "hello world" {
		t.Fatalf("FinalText=%q", result.FinalText)
	}
	if strings.Contains(result.FinalText, "thinking") {
		t.Fatalf("thinking leaked into FinalText: %q", result.FinalText)
	}
	if out.String() != "hello world" || result.Transcript != out.String() {
		t.Fatalf("stream/capture mismatch: out=%q transcript=%q", out.String(), result.Transcript)
	}
	if strings.TrimSpace(errOut.String()) != "" {
		t.Fatalf("unexpected stderr: %s", errOut.String())
	}
}
