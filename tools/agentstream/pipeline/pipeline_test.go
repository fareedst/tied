package pipeline

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"stdd/agentstream"
)

// REQ: REQ-GOAGENT-PIPELINE
func TestSliceFromFirstTurn(t *testing.T) {
	turns := []agentstream.Turn{
		{Parts: []string{"a"}},
		{Parts: []string{"b"}},
		{Parts: []string{"c"}},
	}
	out, err := SliceFromFirstTurn(turns, 1)
	if err != nil || len(out) != 3 {
		t.Fatalf("first=1: %v len=%d", err, len(out))
	}
	out, err = SliceFromFirstTurn(turns, 2)
	if err != nil || len(out) != 2 || len(out[0].Parts) != 1 || out[0].Parts[0] != "b" {
		t.Fatalf("first=2: %v %#v", err, out)
	}
	out, err = SliceFromFirstTurn(turns, 3)
	if err != nil || len(out) != 1 || out[0].Parts[0] != "c" {
		t.Fatalf("first=3: %v %#v", err, out)
	}
	if _, err := SliceFromFirstTurn(turns, 0); err == nil {
		t.Fatal("first=0 want error")
	}
	if _, err := SliceFromFirstTurn(turns, 4); err == nil {
		t.Fatal("first=4 want error")
	}
}

// REQ: REQ-GOAGENT-PIPELINE
func TestChainBetween(t *testing.T) {
	// use minimal turns from text + file
	dir := t.TempDir()
	f := filepath.Join(dir, "one.txt")
	_ = os.WriteFile(f, []byte("x"), 0o644)
	in := Input{
		PromptFiles:               []string{f},
		FeatureSpecBatchYAMLPaths: []string{}, // no feature yaml in this test
	}
	// need at least one source - use prompt file only
	turns, err := Build(in)
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) != 1 {
		t.Fatalf("%d", len(turns))
	}
	cb := ChainBetween(turns)
	if cb != nil {
		t.Fatalf("%+v", cb)
	}
}

func TestSessionForTurn(t *testing.T) {
	chain := []bool{true, false}
	if SessionForTurn(0, "s1", chain, "") != "s1" {
		t.Fatal()
	}
	if SessionForTurn(1, "s1", chain, "run") != "run" {
		t.Fatal()
	}
	if SessionForTurn(2, "s1", chain, "run") != "" {
		t.Fatal()
	}
}

// REQ: REQ-GOAGENT-PIPELINE-CHAIN, REQ-GOAGENT-YAML-STEP-RENDER
func TestBuild_leadChecklistStepBounds(t *testing.T) {
	dir := t.TempDir()
	prompt := filepath.Join(dir, "one.txt")
	if err := os.WriteFile(prompt, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	cl := filepath.Join(dir, "checklist.yaml")
	y := `name: t
version: "0"
process_token: '[P]'
steps:
  - id: A
    title: a
    tasks: [t]
  - id: B
    title: b
    tasks: [t]
  - id: C
    title: c
    tasks: [t]
`
	if err := os.WriteFile(cl, []byte(y), 0o644); err != nil {
		t.Fatal(err)
	}
	in := Input{
		PromptFiles:             []string{prompt},
		LeadChecklistYAML:       cl,
		LeadChecklistStepFromID: "B",
		LeadChecklistStepToID:   "B",
	}
	turns, err := Build(in)
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) != 2 {
		t.Fatalf("want 1 prompt + 1 checklist turn, got %d", len(turns))
	}
	if !strings.Contains(turns[1].Parts[0], "## Step B:") {
		t.Fatalf("expected bounded step B in turn: %q", turns[1].Parts[0])
	}
}
