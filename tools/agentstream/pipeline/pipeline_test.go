package pipeline

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"stdd/agentstream"
)

// [IMPL-GOAGENT-PIPELINE] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
// How: SliceFromFirstTurn returns 1-based suffix; errors on zero or out-of-range first turn.
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

// [IMPL-GOAGENT-PIPELINE] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
// How: ChainBetween returns nil when a single argv turn has no resume chain.
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

// [IMPL-GOAGENT-PIPELINE] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN] [REQ-GOAGENT-YAML-STEP-RENDER]
// How: Build with lead checklist step bounds emits one turn for the inclusive slug slice.
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

// [IMPL-GOAGENT-CHECKLIST-CONTROL] [ARCH-GOAGENT-CHECKLIST-CONTROL] [REQ-GOAGENT-CHECKLIST-CONTROL]
// How: Canonical checklist slice from flag-contradictory-specs through unit-refactor includes control target and emitter steps.
func TestBuild_canonicalChecklistControlSliceIncludesTargetAndEmitter(t *testing.T) {
	checklistPath := filepath.Clean("../../tied/docs/agent-req-implementation-checklist.yaml")
	if _, err := os.Stat(checklistPath); err != nil {
		t.Skipf("canonical checklist not available: %v", err)
	}
	turns, err := Build(Input{
		LeadChecklistYAML:       checklistPath,
		LeadChecklistSkipSub:    true,
		LeadChecklistStepFromID: "flag-contradictory-specs",
		LeadChecklistStepToID:   "unit-refactor",
	})
	if err != nil {
		t.Fatal(err)
	}
	known := KnownStepStubs(turns)
	for _, slug := range []string{"flag-contradictory-specs", "unit-test-green", "unit-refactor"} {
		if !known[slug] {
			t.Fatalf("canonical control smoke slice missing %q; loaded=%v", slug, known)
		}
	}
	if turns[0].StepStub != "flag-contradictory-specs" || turns[len(turns)-1].StepStub != "unit-refactor" {
		t.Fatalf("unexpected bounded slice edges: first=%q last=%q", turns[0].StepStub, turns[len(turns)-1].StepStub)
	}
}

// [IMPL-GOAGENT-PIPELINE] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
// How: ApplyPromptFilePreload prepends preload on new sessions after ChainFromPrevious false breaks the chain.
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

// [IMPL-GOAGENT-PIPELINE] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
// How: ApplyPromptFilePreload skips prepend on first turn when initial session id is set for resume.
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

// [IMPL-GOAGENT-CHECKLIST-CONTROL] [ARCH-GOAGENT-CHECKLIST-CONTROL] [REQ-GOAGENT-CHECKLIST-CONTROL]
// How: ReplaceRemainingFromStep rewrites queue from unit-test-green goto to flag-contradictory-specs.
func TestReplaceRemainingFromStep_loopBackToContradictions(t *testing.T) {
	turns := []agentstream.Turn{
		{Parts: []string{"flag"}, StepStub: "flag-contradictory-specs", ChainFromPrevious: true},
		{Parts: []string{"resolve"}, StepStub: "resolve-pseudocode", ChainFromPrevious: true},
		{Parts: []string{"red"}, StepStub: "unit-test-red", ChainFromPrevious: false},
		{Parts: []string{"green"}, StepStub: "unit-test-green", ChainFromPrevious: true},
		{Parts: []string{"refactor"}, StepStub: "unit-refactor", ChainFromPrevious: true},
	}
	got, err := ReplaceRemainingFromStep(turns, 3, "flag-contradictory-specs")
	if err != nil {
		t.Fatal(err)
	}
	var stubs []string
	for _, t := range got {
		stubs = append(stubs, t.StepStub)
	}
	want := []string{
		"flag-contradictory-specs",
		"resolve-pseudocode",
		"unit-test-red",
		"unit-test-green",
		"flag-contradictory-specs",
		"resolve-pseudocode",
		"unit-test-red",
		"unit-test-green",
		"unit-refactor",
	}
	if strings.Join(stubs, ",") != strings.Join(want, ",") {
		t.Fatalf("stubs mismatch:\n got %v\nwant %v", stubs, want)
	}
}

// [IMPL-GOAGENT-CHECKLIST-CONTROL] [ARCH-GOAGENT-CHECKLIST-CONTROL] [REQ-GOAGENT-CHECKLIST-CONTROL]
// How: ReplaceRemainingFromStep errors when goto target slug is not in the loaded checklist turns.
func TestReplaceRemainingFromStep_missingTarget(t *testing.T) {
	_, err := ReplaceRemainingFromStep([]agentstream.Turn{{StepStub: "unit-test-green"}}, 0, "missing")
	if err == nil {
		t.Fatal("want missing target error")
	}
}

// [IMPL-GOAGENT-PIPELINE] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
// How: Build default order concatenates feature-spec batch turn(s) then lead checklist turns.
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

// [IMPL-GOAGENT-PIPELINE] [ARCH-GOAGENT-PIPELINE] [REQ-GOAGENT-PIPELINE-CHAIN]
// How: Build with checklist-before-feature-spec flag orders checklist turns before batch turns.
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
