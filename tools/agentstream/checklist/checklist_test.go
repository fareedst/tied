package checklist

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// REQ: REQ-GOAGENT-YAML-STEP-RENDER
const testChecklistYAML = `
name: test_checklist
version: "0"
process_token: '[PROC-TEST]'
steps:
  - id: S01
    title: First
    tasks: [a]
  - id: S02
    title: Second
    tasks: [b]
  - id: S03
    title: Third
    tasks: [c]
sub_procedures:
  - id: SUB-X
    title: Sub
    tasks: [subtask]
`

func writeTestYAML(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()
	p := filepath.Join(dir, "checklist.yaml")
	if err := os.WriteFile(p, []byte(strings.TrimLeft(testChecklistYAML, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

func TestMessagesFromYAML_fullSteps(t *testing.T) {
	path := writeTestYAML(t)
	msgs, err := MessagesFromYAML(path, Options{})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 3 {
		t.Fatalf("want 3 main step messages, got %d", len(msgs))
	}
	if !strings.Contains(msgs[0], "## Step S01:") || !strings.Contains(msgs[2], "## Step S03:") {
		t.Fatalf("unexpected content: %#v", msgs)
	}
}

func TestMessagesFromYAML_boundsBoth(t *testing.T) {
	path := writeTestYAML(t)
	msgs, err := MessagesFromYAML(path, Options{StepFromID: "S02", StepToID: "S02"})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 1 || !strings.Contains(msgs[0], "## Step S02:") {
		t.Fatalf("got %#v", msgs)
	}
}

func TestMessagesFromYAML_lowerOnly(t *testing.T) {
	path := writeTestYAML(t)
	msgs, err := MessagesFromYAML(path, Options{StepFromID: "S02"})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 2 {
		t.Fatalf("want 2 messages, got %d", len(msgs))
	}
	if !strings.Contains(msgs[0], "## Step S02:") || !strings.Contains(msgs[1], "## Step S03:") {
		t.Fatal()
	}
}

func TestMessagesFromYAML_upperOnly(t *testing.T) {
	path := writeTestYAML(t)
	msgs, err := MessagesFromYAML(path, Options{StepToID: "S02"})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 2 {
		t.Fatalf("want 2 messages, got %d", len(msgs))
	}
	if !strings.Contains(msgs[0], "## Step S01:") || !strings.Contains(msgs[1], "## Step S02:") {
		t.Fatal()
	}
}

func TestMessagesFromYAML_withSubs(t *testing.T) {
	path := writeTestYAML(t)
	msgs, err := MessagesFromYAML(path, Options{
		IncludeSubProcedures: true,
		StepFromID:           "S03",
		StepToID:             "S03",
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 2 {
		t.Fatalf("want 1 main + 1 sub, got %d", len(msgs))
	}
	if !strings.Contains(msgs[0], "## Step S03:") || !strings.Contains(msgs[1], "## SUB-X:") {
		t.Fatal()
	}
}

func TestMessagesFromYAML_missingFromID(t *testing.T) {
	path := writeTestYAML(t)
	_, err := MessagesFromYAML(path, Options{StepFromID: "Nope"})
	if err == nil || !strings.Contains(err.Error(), "not found") {
		t.Fatalf("want not found error, got %v", err)
	}
}

func TestMessagesFromYAML_missingToID(t *testing.T) {
	path := writeTestYAML(t)
	_, err := MessagesFromYAML(path, Options{StepToID: "Nope"})
	if err == nil || !strings.Contains(err.Error(), "not found") {
		t.Fatalf("want not found error, got %v", err)
	}
}

func TestMessagesFromYAML_invertedRange(t *testing.T) {
	path := writeTestYAML(t)
	_, err := MessagesFromYAML(path, Options{StepFromID: "S03", StepToID: "S01"})
	if err == nil || !strings.Contains(err.Error(), "invalid") {
		t.Fatalf("want invalid range error, got %v", err)
	}
}
