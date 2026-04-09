package text

import (
	"os"
	"path/filepath"
	"testing"

	"stdd/agentstream"
)

// REQ: REQ-GOAGENT-TEXT-SOURCES
func TestTurnsFromPromptsFile_split(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "m.txt")
	_ = os.WriteFile(p, []byte("hello\n---\nworld\n"), 0o644)
	turns, err := TurnsFromPromptsFiles([]string{p})
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) != 2 || turns[0].Parts[0] != "hello" || turns[1].Parts[0] != "world" {
		t.Fatalf("%+v", turns)
	}
	if !turns[0].ChainFromPrevious || !turns[1].ChainFromPrevious {
		t.Fatalf("expected chain true")
	}
}

func TestArgvTurn(t *testing.T) {
	ts := ArgvTurn([]string{"a", "b"})
	if len(ts) != 1 || len(ts[0].Parts) != 2 {
		t.Fatalf("%+v", ts)
	}
}

func TestVerifySessionTurn(t *testing.T) {
	ts := VerifySessionTurn()
	if len(ts) != 1 || ts[0].Parts[0] != agentstream.VerifySessionPrompt {
		t.Fatalf("%+v", ts)
	}
}
