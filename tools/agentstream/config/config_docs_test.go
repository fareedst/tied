package config

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

// [IMPL-GOAGENT-CLI-CMD] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: A31 static contract — every CLI flag in UsageText appears in README.
func TestREADMEDocumentsAllConfigFlags(t *testing.T) {
	readmePath := filepath.Join("..", "README.md")
	readme, err := os.ReadFile(readmePath)
	if err != nil {
		t.Fatalf("read README: %v", err)
	}
	readmeText := string(readme)
	usage := UsageText("agentstream")

	flagPattern := regexp.MustCompile(`(?m)^\s*(?:-[a-zA-Z], )?(--[a-z0-9-]+)`)
	matches := flagPattern.FindAllStringSubmatch(usage, -1)
	if len(matches) == 0 {
		t.Fatal("no flags found in UsageText")
	}
	seen := make(map[string]struct{})
	for _, m := range matches {
		flag := m[1]
		if _, ok := seen[flag]; ok {
			continue
		}
		seen[flag] = struct{}{}
		if !strings.Contains(readmeText, flag) {
			t.Errorf("README.md missing flag documented in UsageText: %s", flag)
		}
	}

	shortPattern := regexp.MustCompile(`(?m)^\s*-([a-zA-Z]),`)
	for _, m := range shortPattern.FindAllStringSubmatch(usage, -1) {
		short := "-" + m[1]
		longLine := regexp.MustCompile(`(?m)^\s*` + regexp.QuoteMeta(short) + `, (--[a-z0-9-]+)`)
		longMatch := longLine.FindStringSubmatch(usage)
		if longMatch == nil {
			continue
		}
		long := longMatch[1]
		if strings.Contains(readmeText, short) || strings.Contains(readmeText, long) {
			continue
		}
		t.Errorf("README.md missing short or long form for %s / %s", short, long)
	}
}
