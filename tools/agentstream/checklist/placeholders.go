// REQ: REQ-GOAGENT-YAML-STEPS, REQ-GOAGENT-YAML-STEP-RENDER
package checklist

import (
	"regexp"
	"strings"
)

// Placeholder syntax: {{NAME}} with NAME matching [A-Za-z0-9_]+.
var checklistPlaceholderPattern = regexp.MustCompile(`\{\{([A-Za-z0-9_]+)\}\}`)

// expandPlaceholders replaces each {{KEY}} with vars[KEY] when present; otherwise leaves the token unchanged.
func expandPlaceholders(s string, vars map[string]string) string {
	if len(vars) == 0 {
		return s
	}
	return checklistPlaceholderPattern.ReplaceAllStringFunc(s, func(m string) string {
		parts := checklistPlaceholderPattern.FindStringSubmatch(m)
		if len(parts) < 2 {
			return m
		}
		key := parts[1]
		if v, ok := vars[key]; ok {
			return v
		}
		return m
	})
}

func hasResidualChecklistPlaceholder(s string) bool {
	return checklistPlaceholderPattern.MatchString(s)
}

// expandThenStub applies placeholder expansion then stub-reference normalization (slug flow targets).
func expandThenStub(s string, vars map[string]string, stubMap map[string]string, stubKeys []string) string {
	return replaceStubRefsInText(expandPlaceholders(s, vars), stubMap, stubKeys)
}

func trimExpandThenStub(s string, vars map[string]string, stubMap map[string]string, stubKeys []string) string {
	return expandThenStub(strings.TrimSpace(s), vars, stubMap, stubKeys)
}
