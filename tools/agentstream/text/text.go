// Package text builds Turns from argv words, prompt files, and multi-block prompts files.
// REQ: REQ-GOAGENT-TEXT-SOURCES
// ARCH: ARCH-GOAGENT-TEXT-SOURCES
// IMPL: IMPL-GOAGENT-TEXT-SOURCES
package text

import (
	"os"
	"regexp"
	"strings"

	"stdd/agentstream"
)

var promptsFileSep = regexp.MustCompile(`\r?\n---\s*\r?\n`)

// ArgvTurn returns one Turn from words after `--` (each word a separate agent argv part). REQ-GOAGENT-TEXT-SOURCES.
func ArgvTurn(words []string) []agentstream.Turn {
	if len(words) == 0 {
		return nil
	}
	parts := append([]string(nil), words...)
	return []agentstream.Turn{{Parts: parts, ChainFromPrevious: true}}
}

// TurnsFromPromptFiles reads each path as one UTF-8 Turn. REQ-GOAGENT-TEXT-SOURCES.
// Note: tools/agentstream pipeline does not use this for --prompt-file; the CLI prepends file bodies on new sessions (pipeline.ReadPromptFilePreload / ApplyPromptFilePreload).
func TurnsFromPromptFiles(paths []string) ([]agentstream.Turn, error) {
	var out []agentstream.Turn
	for _, p := range paths {
		b, err := os.ReadFile(p)
		if err != nil {
			return nil, err
		}
		out = append(out, agentstream.Turn{
			Parts:             []string{strings.TrimSpace(string(b))},
			ChainFromPrevious: true,
		})
	}
	return out, nil
}

// TurnsFromPromptsFiles splits each file on `\\n---\\n` boundaries (Ruby-compatible). REQ-GOAGENT-TEXT-SOURCES.
func TurnsFromPromptsFiles(paths []string) ([]agentstream.Turn, error) {
	var out []agentstream.Turn
	for _, p := range paths {
		b, err := os.ReadFile(p)
		if err != nil {
			return nil, err
		}
		chunks := promptsFileSep.Split(string(b), -1)
		for _, ch := range chunks {
			s := strings.TrimSpace(ch)
			if s == "" {
				continue
			}
			out = append(out, agentstream.Turn{Parts: []string{s}, ChainFromPrevious: true})
		}
	}
	return out, nil
}

// VerifySessionTurn appends the sentinel prompt. REQ-GOAGENT-TEXT-SOURCES.
func VerifySessionTurn() []agentstream.Turn {
	return []agentstream.Turn{{
		Parts:             []string{agentstream.VerifySessionPrompt},
		ChainFromPrevious: true,
	}}
}
