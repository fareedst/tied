package executor

import (
	"bytes"
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: thinking excluded from FinalText; receipt in thinking-only stream fails downstream parse.
func TestRunThinkingExcludedFromFinalText(t *testing.T) {
	dir := t.TempDir()
	agent := filepath.Join(dir, "agent-stub.sh")
	script := `#!/bin/sh
printf '%s\n' '{"session_id":"s-think","type":"thinking","subtype":"delta","text":"secret receipt "}'
printf '%s\n' '{"session_id":"s-think","type":"thinking","subtype":"completed"}'
printf '%s\n' '{"session_id":"s-think","type":"assistant","message":{"content":[{"type":"text","text":"visible only"}]}}'
`
	if err := os.WriteFile(agent, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	var out, errOut bytes.Buffer
	result, code, err := Run(context.Background(), []string{agent}, &out, &errOut)
	if err != nil || code != 0 {
		t.Fatalf("run failed: code=%d err=%v", code, err)
	}
	if result.FinalText != "visible only" {
		t.Fatalf("FinalText=%q want visible only", result.FinalText)
	}
	if !strings.Contains(result.ThinkingText, "secret receipt") {
		t.Fatalf("ThinkingText missing thinking delta: %q", result.ThinkingText)
	}
	if strings.Contains(result.FinalText, "agentstream_tracker") || strings.Contains(result.FinalText, "secret receipt") {
		t.Fatalf("thinking leaked into FinalText: %q", result.FinalText)
	}
	if !strings.Contains(result.Transcript, "secret receipt") {
		t.Fatalf("Transcript should retain full audit: %q", result.Transcript)
	}
}

func TestRunReceiptInThinkingOnlyExcludedFromFinalText(t *testing.T) {
	dir := t.TempDir()
	agent := filepath.Join(dir, "agent-stub.sh")
	script := "#!/bin/sh\n" +
		`printf '%s\n' '{"session_id":"s-2","type":"thinking","subtype":"delta","text":"thinking-only body"}'` + "\n" +
		`printf '%s\n' '{"session_id":"s-2","type":"thinking","subtype":"completed"}'` + "\n" +
		`printf '%s\n' '{"session_id":"s-2","type":"assistant","message":{"content":[{"type":"text","text":"done"}]}}'` + "\n"
	if err := os.WriteFile(agent, []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	var out, errOut bytes.Buffer
	result, _, err := Run(context.Background(), []string{agent}, &out, &errOut)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(result.FinalText, "thinking-only body") {
		t.Fatalf("thinking must not appear in FinalText: %q", result.FinalText)
	}
	if result.FinalText != "done" {
		t.Fatalf("FinalText=%q", result.FinalText)
	}
}
