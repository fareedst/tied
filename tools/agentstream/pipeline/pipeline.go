// Package pipeline assembles Turns from all sources in Ruby-compatible order.
// REQ: REQ-GOAGENT-PIPELINE, REQ-ATDD-COMPOS-AGENT_STREAM_TDD_YAML
// ARCH: ARCH-GOAGENT-PIPELINE
// IMPL: IMPL-GOAGENT-PIPELINE
package pipeline

import (
	"fmt"
	"os"
	"strings"

	"stdd/agentstream"
	"stdd/agentstream/checklist"
	"stdd/agentstream/featurespec"
	"stdd/agentstream/tddloop"
	"stdd/agentstream/text"
)

// Input carries resolved paths and options for building Turns. REQ-GOAGENT-PIPELINE.
// Prompt file bodies are not turns; the caller reads paths with ReadPromptFilePreload and calls ApplyPromptFilePreload.
type Input struct {
	ArgvWords                 []string
	PromptsFiles              []string
	TddYAMLPaths              []string
	FeatureSpecBatchYAMLPaths []string
	FeatureSpecOpts           *featurespec.Options
	LeadChecklistYAML         string
	LeadChecklistSkipSub      bool
	LeadChecklistStepFromID   string
	LeadChecklistStepToID     string
	ChecklistVars             map[string]string
	ChecklistVarStrict        bool
	VerifySession             bool
	// LeadChecklistBeforeFeatureSpec: when true and both feature-spec batch and lead checklist are present,
	// emit all checklist turns before all feature-spec turns (default: feature-spec then checklist).
	LeadChecklistBeforeFeatureSpec bool
}

// Build returns Turns in argv → prompts-file → tdd → (feature-spec then lead-checklist, or the reverse when
// LeadChecklistBeforeFeatureSpec and both sources exist) → verify order. REQ-GOAGENT-PIPELINE.
// Use ReadPromptFilePreload + ApplyPromptFilePreload for each --prompt-file path (session prefix on new sessions).
func Build(in Input) ([]agentstream.Turn, error) {
	var turns []agentstream.Turn
	turns = append(turns, text.ArgvTurn(in.ArgvWords)...)
	psf, err := text.TurnsFromPromptsFiles(in.PromptsFiles)
	if err != nil {
		return nil, err
	}
	turns = append(turns, psf...)
	for _, p := range in.TddYAMLPaths {
		ts, err := tddloop.LoadTurns(p)
		if err != nil {
			return nil, err
		}
		turns = append(turns, ts...)
	}

	var fsTurns []agentstream.Turn
	for _, p := range in.FeatureSpecBatchYAMLPaths {
		ts, err := featurespec.LoadTurns(p, in.FeatureSpecOpts)
		if err != nil {
			return nil, err
		}
		fsTurns = append(fsTurns, ts...)
	}

	var clTurns []agentstream.Turn
	if in.LeadChecklistYAML != "" {
		ts, err := checklist.LoadTurns(in.LeadChecklistYAML, checklist.Options{
			IncludeSubProcedures: !in.LeadChecklistSkipSub,
			StepFromID:           in.LeadChecklistStepFromID,
			StepToID:             in.LeadChecklistStepToID,
			Vars:                 in.ChecklistVars,
			ChecklistVarStrict:   in.ChecklistVarStrict,
		})
		if err != nil {
			return nil, err
		}
		clTurns = ts
	}

	both := len(fsTurns) > 0 && len(clTurns) > 0
	if in.LeadChecklistBeforeFeatureSpec && both {
		turns = append(turns, clTurns...)
		turns = append(turns, fsTurns...)
	} else {
		turns = append(turns, fsTurns...)
		turns = append(turns, clTurns...)
	}
	if in.VerifySession {
		turns = append(turns, text.VerifySessionTurn()...)
	}
	if len(turns) == 0 {
		return nil, fmt.Errorf("no prompts: provide argv after --, --prompt-file, --prompts-file, --tdd-yaml, --feature-spec-batch-yaml, and/or --lead-checklist-yaml")
	}
	return turns, nil
}

// ReadPromptFilePreload reads each path as UTF-8 and returns one trimmed string per file (argv-order parts). REQ-GOAGENT-PIPELINE.
func ReadPromptFilePreload(paths []string) ([]string, error) {
	var out []string
	for _, p := range paths {
		b, err := os.ReadFile(p)
		if err != nil {
			return nil, err
		}
		out = append(out, strings.TrimSpace(string(b)))
	}
	return out, nil
}

// ApplyPromptFilePreload prepends preload parts to every turn that starts without --resume (SessionForTurn empty).
// It simulates successful session capture after each turn (running session id non-empty) like the live driver. REQ-GOAGENT-PIPELINE.
func ApplyPromptFilePreload(turns []agentstream.Turn, initialSession string, preload []string) {
	if len(preload) == 0 || len(turns) == 0 {
		return
	}
	chain := ChainBetween(turns)
	const runningSim = "session-placeholder"
	running := ""
	for i := range turns {
		sess := SessionForTurn(i, initialSession, chain, running)
		if sess == "" {
			parts := make([]string, 0, len(preload)+len(turns[i].Parts))
			parts = append(parts, preload...)
			parts = append(parts, turns[i].Parts...)
			turns[i].Parts = parts
		}
		running = runningSim
	}
}

// ChainBetween returns chain_between[i]: turn i+1 resumes session from turn i. REQ-GOAGENT-PIPELINE.
func ChainBetween(turns []agentstream.Turn) []bool {
	if len(turns) < 2 {
		return nil
	}
	out := make([]bool, len(turns)-1)
	for i := 0; i < len(turns)-1; i++ {
		out[i] = turns[i+1].ChainFromPrevious
	}
	return out
}

// SliceFromFirstTurn returns turns[first-1:] for 1-based first; errors if first < 1 or first > len(turns). REQ-GOAGENT-PIPELINE.
func SliceFromFirstTurn(turns []agentstream.Turn, first int) ([]agentstream.Turn, error) {
	if first < 1 {
		return nil, fmt.Errorf("--first-turn must be >= 1")
	}
	if first > len(turns) {
		return nil, fmt.Errorf("--first-turn %d exceeds turn count %d", first, len(turns))
	}
	return turns[first-1:], nil
}

// SessionForTurn returns resume ID for this turn index (nil = new session). REQ-GOAGENT-PIPELINE.
func SessionForTurn(idx int, initialSession string, chain []bool, runningSession string) string {
	if idx == 0 {
		return initialSession
	}
	if len(chain) < idx {
		return ""
	}
	if chain[idx-1] {
		return runningSession
	}
	return ""
}
