package tiedpreflight

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"testing"
)

func writeMCP(t *testing.T, dir, tiedBase string) string {
	t.Helper()
	cursorDir := filepath.Join(dir, ".cursor")
	if err := os.MkdirAll(cursorDir, 0o755); err != nil {
		t.Fatal(err)
	}
	p := filepath.Join(cursorDir, "mcp.json")
	cfg := map[string]interface{}{
		"mcpServers": map[string]interface{}{
			"tied-yaml": map[string]interface{}{
				"command": "node",
				"args":    []string{"/srv/index.js"},
				"env": map[string]string{
					"TIED_BASE_PATH": tiedBase,
				},
			},
		},
	}
	b, err := json.Marshal(cfg)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(p, b, 0o644); err != nil {
		t.Fatal(err)
	}
	return p
}

func TestLocateMCPJSON_root(t *testing.T) {
	w := t.TempDir()
	want := writeMCP(t, w, filepath.Join(w, "tied"))
	got, err := LocateMCPJSON(w, "")
	if err != nil {
		t.Fatal(err)
	}
	if got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}

func TestLocateMCPJSON_subdir(t *testing.T) {
	w := t.TempDir()
	sub := filepath.Join(w, "proj")
	if err := os.MkdirAll(sub, 0o755); err != nil {
		t.Fatal(err)
	}
	tied := filepath.Join(sub, "tied")
	if err := os.MkdirAll(tied, 0o755); err != nil {
		t.Fatal(err)
	}
	want := writeMCP(t, sub, tied)
	got, err := LocateMCPJSON(w, "")
	if err != nil {
		t.Fatal(err)
	}
	if got != want {
		t.Fatalf("got %q want %q", got, want)
	}
}

func TestLocateMCPJSON_ambiguous(t *testing.T) {
	w := t.TempDir()
	for _, name := range []string{"a", "b"} {
		sub := filepath.Join(w, name)
		if err := os.MkdirAll(sub, 0o755); err != nil {
			t.Fatal(err)
		}
		tied := filepath.Join(sub, "tied")
		_ = os.MkdirAll(tied, 0o755)
		writeMCP(t, sub, tied)
	}
	_, err := LocateMCPJSON(w, "")
	var amb *ErrAmbiguous
	if err == nil {
		t.Fatal("expected ambiguous error")
	}
	if !errors.As(err, &amb) {
		t.Fatalf("expected ErrAmbiguous, got %T %v", err, err)
	}
	if len(amb.Paths) != 2 {
		t.Fatalf("paths: %v", amb.Paths)
	}
}

func TestLocateMCPJSON_override(t *testing.T) {
	w := t.TempDir()
	other := t.TempDir()
	p := writeMCP(t, other, filepath.Join(other, "tied"))
	got, err := LocateMCPJSON(w, p)
	if err != nil {
		t.Fatal(err)
	}
	if got != p {
		t.Fatalf("got %q want %q", got, p)
	}
}

func TestAnalyze_ok(t *testing.T) {
	w := t.TempDir()
	tied := filepath.Join(w, "tied")
	if err := os.MkdirAll(tied, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(tied, "requirements.yaml"), []byte("requirements: {}\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	mcp := writeMCP(t, w, tied)
	res, err := Analyze(w, mcp)
	if err != nil {
		t.Fatal(err)
	}
	if res.Status != StatusOK {
		t.Fatalf("status %v errors %v warnings %v", res.Status, res.Errors, res.Warnings)
	}
}

func TestAnalyze_outsideWorkspace(t *testing.T) {
	w := t.TempDir()
	outside := t.TempDir()
	tied := filepath.Join(outside, "tied")
	if err := os.MkdirAll(tied, 0o755); err != nil {
		t.Fatal(err)
	}
	mcp := writeMCP(t, w, tied)
	res, err := Analyze(w, mcp)
	if err != nil {
		t.Fatal(err)
	}
	if res.Status != StatusBlocked {
		t.Fatalf("want blocked got %v %v", res.Status, res.Errors)
	}
}

func TestAnalyze_missingTiedYAML(t *testing.T) {
	w := t.TempDir()
	tied := filepath.Join(w, "tied")
	_ = os.MkdirAll(tied, 0o755)
	mcp := writeMCP(t, w, tied)
	// strip tied-yaml from json
	p := mcp
	b, _ := os.ReadFile(p)
	var root map[string]interface{}
	_ = json.Unmarshal(b, &root)
	ms := root["mcpServers"].(map[string]interface{})
	delete(ms, "tied-yaml")
	b2, _ := json.Marshal(root)
	_ = os.WriteFile(p, b2, 0o644)

	res, err := Analyze(w, p)
	if err != nil {
		t.Fatal(err)
	}
	if res.Status != StatusBlocked {
		t.Fatalf("want blocked got %v %v", res.Status, res.Errors)
	}
}

func TestAnalyze_relativeBasePath(t *testing.T) {
	w := t.TempDir()
	cursorDir := filepath.Join(w, ".cursor")
	_ = os.MkdirAll(cursorDir, 0o755)
	p := filepath.Join(cursorDir, "mcp.json")
	cfg := map[string]interface{}{
		"mcpServers": map[string]interface{}{
			"tied-yaml": map[string]interface{}{
				"command": "node",
				"args":    []string{"/x"},
				"env": map[string]string{
					"TIED_BASE_PATH": "tied",
				},
			},
		},
	}
	b, _ := json.Marshal(cfg)
	_ = os.WriteFile(p, b, 0o644)

	res, err := Analyze(w, p)
	if err != nil {
		t.Fatal(err)
	}
	if res.Status != StatusBlocked {
		t.Fatalf("want blocked got %v %v", res.Status, res.Errors)
	}
}

func TestAnalyze_greenfieldWarning(t *testing.T) {
	w := t.TempDir()
	tied := filepath.Join(w, "tied")
	_ = os.MkdirAll(tied, 0o755)
	mcp := writeMCP(t, w, tied)
	res, err := Analyze(w, mcp)
	if err != nil {
		t.Fatal(err)
	}
	if res.Status != StatusWarning {
		t.Fatalf("want warning got %v", res.Status)
	}
	if len(res.Warnings) == 0 {
		t.Fatal("expected warnings")
	}
}
