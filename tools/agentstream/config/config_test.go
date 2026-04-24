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

// REQ: REQ-GOAGENT-CLI-CONFIG
func TestWorkspacePreloadMergedWithExplicitPromptFile(t *testing.T) {
	dir := t.TempDir()
	contract := filepath.Join(dir, "tied", "agent-preload-contract.yaml")
	extra := filepath.Join(dir, "p.txt")
	if err := os.MkdirAll(filepath.Dir(contract), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(contract, []byte("c"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(extra, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	cfg, err := ParseAndResolve(dir, []string{"--prompt-file", extra})
	if err != nil {
		t.Fatal(err)
	}
	if len(cfg.PromptFiles) != 2 {
		t.Fatalf("len(PromptFiles)=%d want 2: %v", len(cfg.PromptFiles), cfg.PromptFiles)
	}
	if filepath.Clean(cfg.PromptFiles[0]) != filepath.Clean(contract) {
		t.Fatalf("first prompt want workspace contract: got %#v", cfg.PromptFiles)
	}
	if filepath.Clean(cfg.PromptFiles[1]) != filepath.Clean(extra) {
		t.Fatalf("second prompt: got %#v", cfg.PromptFiles)
	}
}

func TestWorkspacePreloadDeduplicateExplicitSamePath(t *testing.T) {
	dir := t.TempDir()
	contract := filepath.Join(dir, "tied", "agent-preload-contract.yaml")
	if err := os.MkdirAll(filepath.Dir(contract), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(contract, []byte("c"), 0o644); err != nil {
		t.Fatal(err)
	}
	cfg, err := ParseAndResolve(dir, []string{"--prompt-file", contract})
	if err != nil {
		t.Fatal(err)
	}
	if len(cfg.PromptFiles) != 1 {
		t.Fatalf("len(PromptFiles)=%d want 1: %v", len(cfg.PromptFiles), cfg.PromptFiles)
	}
}

func TestSkipWorkspacePreload(t *testing.T) {
	dir := t.TempDir()
	contract := filepath.Join(dir, "tied", "agent-preload-contract.yaml")
	extra := filepath.Join(dir, "p.txt")
	if err := os.MkdirAll(filepath.Dir(contract), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(contract, []byte("c"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(extra, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	cfg, err := ParseAndResolve(dir, []string{"--skip-workspace-preload", "--prompt-file", extra})
	if err != nil {
		t.Fatal(err)
	}
	if len(cfg.PromptFiles) != 1 {
		t.Fatalf("len(PromptFiles)=%d want 1: %v", len(cfg.PromptFiles), cfg.PromptFiles)
	}
	if filepath.Clean(cfg.PromptFiles[0]) != filepath.Clean(extra) {
		t.Fatalf("got %#v", cfg.PromptFiles)
	}
}

func TestWorkspacePreloadLegacyFallback(t *testing.T) {
	dir := t.TempDir()
	contract := filepath.Join(dir, "agent-preload-contract.yaml")
	if err := os.WriteFile(contract, []byte("c"), 0o644); err != nil {
		t.Fatal(err)
	}
	cfg, err := ParseAndResolve(dir, nil)
	if err != nil {
		t.Fatal(err)
	}
	if len(cfg.PromptFiles) != 1 {
		t.Fatalf("len(PromptFiles)=%d want 1: %v", len(cfg.PromptFiles), cfg.PromptFiles)
	}
	if filepath.Clean(cfg.PromptFiles[0]) != filepath.Clean(contract) {
		t.Fatalf("first prompt want legacy workspace contract: got %#v", cfg.PromptFiles)
	}
}
