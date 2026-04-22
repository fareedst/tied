package config

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// REQ: REQ-GOAGENT-CLI-CONFIG
func TestParseFirstTurn(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "p.txt")
	if err := os.WriteFile(p, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	cfg, err := ParseAndResolve(dir, []string{"--prompt-file", p, "-f", "2"})
	if err != nil {
		t.Fatal(err)
	}
	if cfg.FirstTurn != 2 {
		t.Fatalf("FirstTurn=%d", cfg.FirstTurn)
	}
}

func TestParseFirstTurnDefault(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "p.txt")
	if err := os.WriteFile(p, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	cfg, err := ParseAndResolve(dir, []string{"--prompt-file", p})
	if err != nil {
		t.Fatal(err)
	}
	if cfg.FirstTurn != 1 {
		t.Fatalf("FirstTurn=%d want 1", cfg.FirstTurn)
	}
}

func TestParseFirstTurnErrors(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "p.txt")
	if err := os.WriteFile(p, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	_, err := ParseAndResolve(dir, []string{"--prompt-file", p, "-f"})
	if err == nil {
		t.Fatal("missing value: want error")
	}
	_, err = ParseAndResolve(dir, []string{"--prompt-file", p, "-f", "0"})
	if err == nil {
		t.Fatal("zero: want error")
	}
	_, err = ParseAndResolve(dir, []string{"--prompt-file", p, "-f", "nope"})
	if err == nil {
		t.Fatal("non-int: want error")
	}
}

// REQ: REQ-GOAGENT-CLI-CONFIG
func TestSkipTiedMCPPreflightDefaultAndOptIn(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "p.txt")
	if err := os.WriteFile(p, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	cfg, err := ParseAndResolve(dir, []string{"--prompt-file", p})
	if err != nil {
		t.Fatal(err)
	}
	if !cfg.SkipTiedMCPPreflight {
		t.Fatal("want SkipTiedMCPPreflight true by default")
	}
	cfg2, err := ParseAndResolve(dir, []string{"--prompt-file", p, "--tied-mcp-preflight"})
	if err != nil {
		t.Fatal(err)
	}
	if cfg2.SkipTiedMCPPreflight {
		t.Fatal("want SkipTiedMCPPreflight false with --tied-mcp-preflight")
	}
}

func TestLeadChecklistStepBoundsRequireChecklistPath(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "p.txt")
	if err := os.WriteFile(p, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	_, err := ParseAndResolve(dir, []string{"--prompt-file", p, "--lead-checklist-from-step", "session-bootstrap"})
	if err == nil || !strings.Contains(err.Error(), "lead-checklist-yaml") {
		t.Fatalf("want lead-checklist-yaml error, got %v", err)
	}
}

func TestParseChecklistVar(t *testing.T) {
	dir := t.TempDir()
	p := filepath.Join(dir, "p.txt")
	if err := os.WriteFile(p, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	cfg, err := ParseAndResolve(dir, []string{
		"--prompt-file", p,
		"--checklist-var", "REQ=REQ-X",
		"--lead-checklist-var", `NOTE=a=b`,
		"--checklist-var-strict",
	})
	if err != nil {
		t.Fatal(err)
	}
	if cfg.ChecklistVars["REQ"] != "REQ-X" || cfg.ChecklistVars["NOTE"] != "a=b" {
		t.Fatalf("vars=%v", cfg.ChecklistVars)
	}
	if !cfg.ChecklistVarStrict {
		t.Fatal("want ChecklistVarStrict")
	}
}
