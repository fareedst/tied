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
	in := Input{
		ArgvWords: []string{"hello"},
	}
	turns, err := Build(in)
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) != 1 {
		t.Fatalf("want 1 argv turn, got %d", len(turns))
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
	if err := os.WriteFile(prompt, []byte("PRELOAD\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	cl := filepath.Join(dir, "checklist.yaml")
	y := `name: t
version: "0"
process_token: '[P]'
steps:
  - slug: a-step
    title: a
    tasks: [t]
  - slug: b-step
    title: b
    tasks: [t]
  - slug: c-step
    title: c
    tasks: [t]
`
	if err := os.WriteFile(cl, []byte(y), 0o644); err != nil {
		t.Fatal(err)
	}
	in := Input{
		LeadChecklistYAML:       cl,
		LeadChecklistStepFromID: "b-step",
		LeadChecklistStepToID:   "b-step",
	}
	turns, err := Build(in)
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) != 1 {
		t.Fatalf("want 1 checklist turn, got %d", len(turns))
	}
	preload, err := ReadPromptFilePreload([]string{prompt})
	if err != nil {
		t.Fatal(err)
	}
	ApplyPromptFilePreload(turns, "", preload)
	if len(turns[0].Parts) < 2 || turns[0].Parts[0] != "PRELOAD" {
		t.Fatalf("want preload as first argv part: %#v", turns[0].Parts)
	}
	body := turns[0].Parts[1]
	if !strings.Contains(body, "## Step b-step:") {
		t.Fatalf("expected bounded step b-step in turn: %q", body)
	}
}

// REQ: REQ-GOAGENT-PIPELINE
func TestApplyPromptFilePreload_newSessionAfterChainBreak(t *testing.T) {
	preload := []string{"PREAMBLE"}
	turns := []agentstream.Turn{
		{Parts: []string{"turn-a"}, ChainFromPrevious: true},
		{Parts: []string{"turn-b"}, ChainFromPrevious: false},
		{Parts: []string{"turn-c"}, ChainFromPrevious: true},
	}
	ApplyPromptFilePreload(turns, "", preload)
	if len(turns[0].Parts) != 2 || turns[0].Parts[0] != "PREAMBLE" || turns[0].Parts[1] != "turn-a" {
		t.Fatalf("turn0: %#v", turns[0].Parts)
	}
	if len(turns[1].Parts) != 2 || turns[1].Parts[0] != "PREAMBLE" || turns[1].Parts[1] != "turn-b" {
		t.Fatalf("turn1: %#v", turns[1].Parts)
	}
	if len(turns[2].Parts) != 1 || turns[2].Parts[0] != "turn-c" {
		t.Fatalf("turn2 chained, no prepend: %#v", turns[2].Parts)
	}
}

// REQ: REQ-GOAGENT-PIPELINE
func TestApplyPromptFilePreload_respectsInitialSession(t *testing.T) {
	preload := []string{"PREAMBLE"}
	turns := []agentstream.Turn{
		{Parts: []string{"first"}, ChainFromPrevious: true},
	}
	ApplyPromptFilePreload(turns, "existing-session", preload)
	if len(turns[0].Parts) != 1 || turns[0].Parts[0] != "first" {
		t.Fatalf("with --session-id turn1 resumes, no prepend: %#v", turns[0].Parts)
	}
}

// REQ: REQ-GOAGENT-PIPELINE
func TestBuild_featureSpecThenChecklist_default(t *testing.T) {
	dir := t.TempDir()
	batch := filepath.Join(dir, "batch.yaml")
	cl := filepath.Join(dir, "checklist.yaml")
	if err := os.WriteFile(batch, []byte(`- order: 1
  feature_name: feat
  goal: goaltext
  behavior: |
    FEATURE_BATCH_UNIQUE_MARKER
`), 0o644); err != nil {
		t.Fatal(err)
	}
	y := `name: t
version: "0"
process_token: '[P]'
steps:
  - slug: alpha-step
    title: a
    tasks: [t]
  - slug: beta-step
    title: b
    tasks: [t]
`
	if err := os.WriteFile(cl, []byte(y), 0o644); err != nil {
		t.Fatal(err)
	}
	in := Input{
		FeatureSpecBatchYAMLPaths: []string{batch},
		LeadChecklistYAML:         cl,
	}
	turns, err := Build(in)
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) != 3 {
		t.Fatalf("want 3 turns (feat + 2 checklist), got %d", len(turns))
	}
	if turns[0].StepStub != "" || !strings.Contains(turns[0].Parts[0], "FEATURE_BATCH_UNIQUE_MARKER") {
		t.Fatalf("turn0 want feature-spec body, got stub=%q body prefix=%.80q", turns[0].StepStub, turns[0].Parts[0])
	}
	if turns[1].StepStub != "alpha-step" || turns[2].StepStub != "beta-step" {
		t.Fatalf("want checklist stubs alpha then beta, got %+v %+v", turns[1].StepStub, turns[2].StepStub)
	}
}

// REQ: REQ-GOAGENT-PIPELINE
func TestBuild_checklistBeforeFeatureSpec_flag(t *testing.T) {
	dir := t.TempDir()
	batch := filepath.Join(dir, "batch.yaml")
	cl := filepath.Join(dir, "checklist.yaml")
	if err := os.WriteFile(batch, []byte(`- order: 1
  feature_name: feat
  goal: goaltext
  behavior: |
    FEATURE_BATCH_UNIQUE_MARKER
`), 0o644); err != nil {
		t.Fatal(err)
	}
	y := `name: t
version: "0"
process_token: '[P]'
steps:
  - slug: alpha-step
    title: a
    tasks: [t]
  - slug: beta-step
    title: b
    tasks: [t]
`
	if err := os.WriteFile(cl, []byte(y), 0o644); err != nil {
		t.Fatal(err)
	}
	in := Input{
		FeatureSpecBatchYAMLPaths:      []string{batch},
		LeadChecklistYAML:              cl,
		LeadChecklistBeforeFeatureSpec: true,
	}
	turns, err := Build(in)
	if err != nil {
		t.Fatal(err)
	}
	if len(turns) != 3 {
		t.Fatalf("want 3 turns (2 checklist + feat), got %d", len(turns))
	}
	if turns[0].StepStub != "alpha-step" || turns[1].StepStub != "beta-step" {
		t.Fatalf("want checklist first, got %+v %+v", turns[0].StepStub, turns[1].StepStub)
	}
	if turns[2].StepStub != "" || !strings.Contains(turns[2].Parts[0], "FEATURE_BATCH_UNIQUE_MARKER") {
		t.Fatalf("last turn want feature-spec, got stub=%q", turns[2].StepStub)
	}
}
