// Package control parses explicit agentstream checklist control trailers.
// REQ: REQ-GOAGENT-CHECKLIST-CONTROL
// ARCH: ARCH-GOAGENT-CHECKLIST-CONTROL
// IMPL: IMPL-GOAGENT-CHECKLIST-CONTROL
package control

import (
	"encoding/json"
	"fmt"
	"strings"
)

const (
	SchemaVersion = 1
	ActionGoto    = "goto"
)

// Decision is the machine-readable routing payload emitted by checklist turns.
type Decision struct {
	SchemaVersion int      `json:"schema_version"`
	Action        string   `json:"action"`
	Target        string   `json:"target,omitempty"`
	Reason        string   `json:"reason,omitempty"`
	Evidence      []string `json:"evidence,omitempty"`
}

type envelope struct {
	Decision Decision `json:"agentstream_control"`
}

// Parse scans fenced JSON blocks from latest to earliest and returns the first
// strict agentstream_control envelope. Prose outside fenced JSON is ignored.
func Parse(text string) (Decision, bool, error) {
	blocks := fencedJSONBlocks(text)
	for i := len(blocks) - 1; i >= 0; i-- {
		var raw map[string]json.RawMessage
		if err := json.Unmarshal([]byte(blocks[i]), &raw); err != nil {
			if strings.Contains(blocks[i], "agentstream_control") {
				return Decision{}, false, fmt.Errorf("invalid agentstream_control JSON: %w", err)
			}
			continue
		}
		body, ok := raw["agentstream_control"]
		if !ok {
			continue
		}
		var env envelope
		env.Decision = Decision{}
		if err := json.Unmarshal(body, &env.Decision); err != nil {
			return Decision{}, false, fmt.Errorf("invalid agentstream_control payload: %w", err)
		}
		return env.Decision, true, nil
	}
	return Decision{}, false, nil
}

// Validate checks a parsed decision against the loaded checklist slug set.
func Validate(d Decision, knownSlugs map[string]bool) error {
	if d.SchemaVersion != SchemaVersion {
		return fmt.Errorf("agentstream_control schema_version must be %d, got %d", SchemaVersion, d.SchemaVersion)
	}
	switch d.Action {
	case ActionGoto:
		if strings.TrimSpace(d.Target) == "" {
			return fmt.Errorf("agentstream_control goto requires target")
		}
		if !knownSlugs[d.Target] {
			return fmt.Errorf("agentstream_control target not found in checklist turns: %s", d.Target)
		}
	default:
		return fmt.Errorf("unsupported agentstream_control action: %s", d.Action)
	}
	return nil
}

func fencedJSONBlocks(text string) []string {
	lines := strings.Split(text, "\n")
	var blocks []string
	inFence := false
	var current []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if !inFence {
			if trimmed == "```json" {
				inFence = true
				current = current[:0]
			}
			continue
		}
		if strings.HasPrefix(trimmed, "```") {
			blocks = append(blocks, strings.Join(current, "\n"))
			inFence = false
			current = nil
			continue
		}
		current = append(current, line)
	}
	return blocks
}
