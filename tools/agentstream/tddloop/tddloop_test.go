package tddloop

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// [IMPL-GOAGENT-TDDLOOP] [ARCH-GOAGENT-YAML-STEPS] [REQ-GOAGENT-YAML-STEP-RENDER]
// How: formatStep prefers slug in ## Step heading over numeric id.
func TestMessagesFromYAML_prefersSlugInHeading(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "tdd.yaml")
	y := `
name: t
version: "0"
process_token: '[P]'
steps:
  - slug: unit-test-red
    title: Red
    tasks: [x]
`
	if err := os.WriteFile(p, []byte(strings.TrimLeft(y, "\n")), 0o644); err != nil {
		t.Fatal(err)
	}
	msgs, err := MessagesFromYAML(p)
	if err != nil {
		t.Fatal(err)
	}
	if len(msgs) != 1 || !strings.Contains(msgs[0], "## Step unit-test-red:") {
		t.Fatalf("got %q", msgs)
	}
}
