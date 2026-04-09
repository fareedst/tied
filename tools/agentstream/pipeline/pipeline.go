// Package pipeline assembles Turns from all sources in Ruby-compatible order.
// REQ: REQ-GOAGENT-PIPELINE, REQ-ATDD-COMPOS-AGENT_STREAM_TDD_YAML
// ARCH: ARCH-GOAGENT-PIPELINE
// IMPL: IMPL-GOAGENT-PIPELINE
package pipeline

import (
	"fmt"

	"stdd/agentstream"
	"stdd/agentstream/checklist"
	"stdd/agentstream/featurespec"
	"stdd/agentstream/tddloop"
	"stdd/agentstream/text"
)

// Input carries resolved paths and options for building Turns. REQ-GOAGENT-PIPELINE.
type Input struct {
	ArgvWords                 []string
	PromptFiles               []string
	PromptsFiles              []string
	TddYAMLPaths              []string
	FeatureSpecBatchYAMLPaths []string
	FeatureSpecOpts           *featurespec.Options
	LeadChecklistYAML         string
	LeadChecklistSkipSub      bool
	LeadChecklistStepFromID   string
	LeadChecklistStepToID     string
	VerifySession             bool
}

// Build returns Turns in argv → prompt-file → prompts-file → tdd → feature-spec → lead-checklist → verify order. REQ-GOAGENT-PIPELINE.
func Build(in Input) ([]agentstream.Turn, error) {
	var turns []agentstream.Turn
	turns = append(turns, text.ArgvTurn(in.ArgvWords)...)
	pf, err := text.TurnsFromPromptFiles(in.PromptFiles)
	if err != nil {
		return nil, err
	}
	turns = append(turns, pf...)
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
	for _, p := range in.FeatureSpecBatchYAMLPaths {
		ts, err := featurespec.LoadTurns(p, in.FeatureSpecOpts)
		if err != nil {
			return nil, err
		}
		turns = append(turns, ts...)
	}
	if in.LeadChecklistYAML != "" {
		ts, err := checklist.LoadTurns(in.LeadChecklistYAML, checklist.Options{
			IncludeSubProcedures: !in.LeadChecklistSkipSub,
			StepFromID:           in.LeadChecklistStepFromID,
			StepToID:             in.LeadChecklistStepToID,
		})
		if err != nil {
			return nil, err
		}
		turns = append(turns, ts...)
	}
	if in.VerifySession {
		turns = append(turns, text.VerifySessionTurn()...)
	}
	if len(turns) == 0 {
		return nil, fmt.Errorf("no prompts: provide argv after --, --prompt-file, --prompts-file, --tdd-yaml, --feature-spec-batch-yaml, and/or --lead-checklist-yaml")
	}
	return turns, nil
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
