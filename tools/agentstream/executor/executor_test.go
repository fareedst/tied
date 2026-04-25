package executor

import (
	"bytes"
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// REQ-GOAGENT-CHECKLIST-CONTROL ensures streamed assistant text is also captured for control parsing.
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
	sid, transcript, code, err := Run(context.Background(), []string{agent}, &out, &errOut)
	if err != nil {
		t.Fatal(err)
	}
	if code != 0 || sid != "s-1" {
		t.Fatalf("code/sid mismatch: code=%d sid=%q stderr=%s", code, sid, errOut.String())
	}
	if out.String() != "hello world" || transcript != out.String() {
		t.Fatalf("stream/capture mismatch: out=%q transcript=%q", out.String(), transcript)
	}
	if strings.TrimSpace(errOut.String()) != "" {
		t.Fatalf("unexpected stderr: %s", errOut.String())
	}
}
