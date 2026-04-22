package featurespec

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// REQ: REQ-GOAGENT-FEATURESPEC
func TestMessagesFromYAML_sortAndFilter(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "batch.yaml")
	content := `
- order: 2
  feature_name: B
  goal: g2
- order: 1
  feature_name: A
  goal: g1
`
	if err := os.WriteFile(p, []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
	f, _ := ParseOrderFilter("1")
	msgs, err := MessagesFromYAML(p, &Options{OrderFilter: f})
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 1 || msgs[0][0] != '#' {
		t.Fatalf("unexpected %q", msgs)
	}
	body := msgs[0]
	if !strings.Contains(body, "[1]") || !strings.Contains(body, "A") || !strings.Contains(body, "g1") {
		t.Fatalf("unexpected %q", body)
	}
}

func TestMessagesFromYAML_behaviorOptional(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "batch.yaml")
	withBehavior := `
- order: 1
  feature_name: F
  goal: The goal line.
  behavior: |
    Line one of behavior.
    Line two.
`
	if err := os.WriteFile(p, []byte(withBehavior), 0o644); err != nil {
		t.Fatal(err)
	}
	msgs, err := MessagesFromYAML(p, nil)
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message, got %d", len(msgs))
	}
	body := msgs[0]
	if !strings.Contains(body, "## Behavior") {
		t.Fatalf("missing ## Behavior in %q", body)
	}
	if !strings.Contains(body, "Line one of behavior.") || !strings.Contains(body, "Line two.") {
		t.Fatalf("behavior body not preserved: %q", body)
	}
	// Goal still precedes Behavior section.
	goalIdx := strings.Index(body, "## Goal")
	behIdx := strings.Index(body, "## Behavior")
	if goalIdx < 0 || behIdx < 0 || goalIdx > behIdx {
		t.Fatalf("expected ## Goal before ## Behavior: %q", body)
	}

	p2 := filepath.Join(dir, "no-behavior.yaml")
	noBeh := `
- feature_name: X
  goal: g
`
	if err := os.WriteFile(p2, []byte(noBeh), 0o644); err != nil {
		t.Fatal(err)
	}
	msgs2, err := MessagesFromYAML(p2, nil)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(msgs2[0], "## Behavior") {
		t.Fatalf("did not want ## Behavior when key absent: %q", msgs2[0])
	}
}
