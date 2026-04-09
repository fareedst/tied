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
