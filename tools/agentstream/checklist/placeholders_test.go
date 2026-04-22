package checklist

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestExpandPlaceholders_multipleKeys(t *testing.T) {
	vars := map[string]string{"REQ": "REQ-FOO", "TITLE": "Hello"}
	got := expandPlaceholders("Scope {{REQ}} — {{TITLE}} end", vars)
	want := "Scope REQ-FOO — Hello end"
	if got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}

func TestExpandPlaceholders_missingKeyUnchanged(t *testing.T) {
	got := expandPlaceholders("x {{MISSING}} y", map[string]string{"REQ": "r"})
	if got != "x {{MISSING}} y" {
		t.Fatalf("got %q", got)
	}
}

func TestExpandPlaceholders_valueWithEquals(t *testing.T) {
	vars := map[string]string{"A": "b=c=d"}
	got := expandPlaceholders("{{A}}", vars)
	if got != "b=c=d" {
		t.Fatalf("got %q", got)
	}
}

func TestExpandPlaceholders_emptyVarsNoop(t *testing.T) {
	s := "{{REQ}} unchanged"
	if expandPlaceholders(s, nil) != s {
		t.Fatal()
	}
	if expandPlaceholders(s, map[string]string{}) != s {
		t.Fatal()
	}
}

func TestMessagesFromYAML_placeholdersSubstituted(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "cl.yaml")
	y := `
name: ph
version: "1"
process_token: '[P]'
steps:
  - slug: one
    title: "{{CHANGE_TITLE}}"
    goals: For {{REQ_TOKEN}}.
    tasks:
      - Implement {{REQ_TOKEN}}.
`
	if err := os.WriteFile(p, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	msgs, err := MessagesFromYAML(p, Options{
		Vars: map[string]string{
			"CHANGE_TITLE": "My change",
			"REQ_TOKEN":    "REQ-BAR",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 1 {
		t.Fatalf("got %d msgs", len(msgs))
	}
	if !strings.Contains(msgs[0], "## Step one: My change") {
		t.Fatalf("title not expanded: %s", msgs[0])
	}
	if !strings.Contains(msgs[0], "For REQ-BAR.") {
		t.Fatal()
	}
	if !strings.Contains(msgs[0], "Implement REQ-BAR.") {
		t.Fatal()
	}
}

func TestMessagesFromYAML_strictUnresolved(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "cl.yaml")
	y := `
name: ph
version: "1"
process_token: '[P]'
steps:
  - slug: one
    title: T
    goals: Still {{OPEN}}.
    tasks: [x]
`
	if err := os.WriteFile(p, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	_, err := MessagesFromYAML(p, Options{ChecklistVarStrict: true})
	if err == nil {
		t.Fatal("expected error for unresolved placeholder")
	}
	if !strings.Contains(err.Error(), "{{NAME}}") {
		t.Fatalf("unexpected err: %v", err)
	}
}

func TestMessagesFromYAML_strictOkWhenSubstituted(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "cl.yaml")
	y := `
name: ph
version: "1"
process_token: '[P]'
steps:
  - slug: one
    title: T
    goals: Done {{K}}.
    tasks: [x]
`
	if err := os.WriteFile(p, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	_, err := MessagesFromYAML(p, Options{
		Vars:                 map[string]string{"K": "v"},
		ChecklistVarStrict:   true,
	})
	if err != nil {
		t.Fatal(err)
	}
}
