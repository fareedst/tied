// Package htmlformat is the non-compact HTML transform seam for agentstream Turn.Parts.
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
package htmlformat

import (
	"fmt"
	"strings"

	"stdd/agentstream"
)

// Options matches pseudo-code: enabled gate and stable indent for non-compact output.
type Options struct {
	Enabled      bool
	StableIndent int
}

// CfgForIntegrate is the INTEGRATE_WITH_MAIN gate; cmd/agentstream maps [config.Config].NonCompactHTML (ParseAndResolve / --non-compact-html) here. [REQ-GOAGENT-CLI-CONFIG] [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT]
type CfgForIntegrate struct {
	NonCompactHTML bool
}

// ApplyToTurns implements procedure APPLY_TO_TURNS: if disabled, no-op; else in-place FORMAT per part, propagate errors.
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
func ApplyToTurns(turns []agentstream.Turn, o Options) ([]agentstream.Turn, error) {
	if !o.Enabled {
		return turns, nil
	}
	for i := range turns {
		for j := range turns[i].Parts {
			s, err := FormatNonCompactHTML(turns[i].Parts[j], o)
			if err != nil {
				return nil, err
			}
			turns[i].Parts[j] = s
		}
	}
	return turns, nil
}

// FormatNonCompactHTML implements procedure FORMAT_NON_COMPACT_HTML: "" -> "", nil; else DETERMINISTIC with options (enabled gate via caller / part handling).
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
func FormatNonCompactHTML(part string, o Options) (string, error) {
	if part == "" {
		return "", nil
	}
	if !o.Enabled {
		return part, nil
	}
	return deterministicNonCompactHTMLForPart(part, o), nil
}

// deterministicNonCompactHTMLForPart implements DETERMINISTIC_NON_COMPACT_HTML_FOR_PART: stable, deterministic break from minified single line (UTF-8) using tag boundaries and o.StableIndent.
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
func deterministicNonCompactHTMLForPart(text string, o Options) string {
	if text == "" {
		return ""
	}
	s := addNonCompactLineBreaks(text)
	if o.StableIndent > 0 {
		s = applyStableIndentLines(s, o.StableIndent)
	}
	return s
}

// addNonCompactLineBreaks (used by DETERMINISTIC_NON_COMPACT_HTML_FOR_PART) inserts a newline so output is not a single minified line: tag-adjacent breaks, else after first ">", else plain + newline.
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
func addNonCompactLineBreaks(utf8 string) string {
	s := strings.ReplaceAll(utf8, "><", ">\n<")
	if strings.Contains(s, "\n") {
		return s
	}
	if i := strings.Index(s, ">"); i >= 0 {
		return s[:i+1] + "\n" + s[i+1:]
	}
	return utf8 + "\n"
}

// applyStableIndentLines (used by DETERMINISTIC_NON_COMPACT_HTML_FOR_PART) prefixes continuation lines with n spaces; first line column 0; deterministic.
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
func applyStableIndentLines(s string, n int) string {
	if n <= 0 {
		return s
	}
	pad := strings.Repeat(" ", n)
	lines := strings.Split(s, "\n")
	for i := 1; i < len(lines); i++ {
		if lines[i] == "" {
			continue
		}
		lines[i] = pad + lines[i]
	}
	return strings.Join(lines, "\n")
}

// IntegrateWithMain implements procedure INTEGRATE_WITH_MAIN: nil-guard, skip when off; else APPLY_TO_TURNS and map errors to caller.
// [IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT] [ARCH-GOAGENT-NON-COMPACT-HTML-FORMAT] [REQ-GOAGENT-NON-COMPACT-HTML-FORMAT]
func IntegrateWithMain(cfg *CfgForIntegrate, turns []agentstream.Turn, o Options) error {
	if cfg == nil || turns == nil {
		return nil
	}
	if !cfg.NonCompactHTML {
		return nil
	}
	_, err := ApplyToTurns(turns, o)
	if err != nil {
		return fmt.Errorf("htmlformat integrate: %w", err)
	}
	return nil
}
