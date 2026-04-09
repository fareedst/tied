// Package tiedpreflight validates .cursor/mcp.json for tied-yaml before spawning cursor agent.
// REQ-GOAGENT-CLI-CONFIG (companion guard)
package tiedpreflight

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// ErrNotFound is returned when no .cursor/mcp.json is discovered.
var ErrNotFound = errors.New("tiedpreflight: no .cursor/mcp.json found under workspace")

// ErrAmbiguous is returned when multiple subproject mcp.json files exist without an explicit path.
type ErrAmbiguous struct {
	Paths []string
}

func (e *ErrAmbiguous) Error() string {
	return fmt.Sprintf("tiedpreflight: multiple .cursor/mcp.json files under workspace; pass --mcp-json PATH:\n  %s", strings.Join(e.Paths, "\n  "))
}

// Result summarizes MCP config checks (not runtime Cursor MCP registration).
type Result struct {
	MCPJSONPath   string
	TIEDBasePath  string
	Status        Status
	Errors        []string
	Warnings      []string
	RuntimeNotice string
}

// Status is the worst severity from static checks.
type Status int

const (
	// StatusOK means tied-yaml entry and TIED_BASE_PATH look sane for this workspace.
	StatusOK Status = iota
	// StatusWarning means proceed with caution (e.g. greenfield tied/, or informational only).
	StatusWarning
	// StatusBlocked means configuration is missing or dangerous (e.g. TIED_BASE_PATH outside workspace).
	StatusBlocked
)

// RuntimeMCPNotice is printed whenever preflight runs to remind that Cursor may still omit tied-yaml.
const RuntimeMCPNotice = "agentstream cannot verify that Cursor exposes the tied-yaml MCP server for this workspace; enable tied-yaml in Cursor if agents should edit project TIED YAML via MCP."

// LocateMCPJSON finds .cursor/mcp.json: explicit override, workspace root, or exactly one immediate subdir.
func LocateMCPJSON(workspace, override string) (string, error) {
	workspace = filepath.Clean(workspace)
	if override != "" {
		p := filepath.Clean(override)
		st, err := os.Stat(p)
		if err != nil {
			return "", fmt.Errorf("tiedpreflight: --mcp-json not readable: %w", err)
		}
		if st.IsDir() {
			return "", fmt.Errorf("tiedpreflight: --mcp-json is a directory, expected a file: %s", p)
		}
		return p, nil
	}
	root := filepath.Join(workspace, ".cursor", "mcp.json")
	if st, err := os.Stat(root); err == nil && !st.IsDir() {
		return root, nil
	}
	matches, err := filepath.Glob(filepath.Join(workspace, "*", ".cursor", "mcp.json"))
	if err != nil {
		return "", err
	}
	switch len(matches) {
	case 0:
		return "", ErrNotFound
	case 1:
		return matches[0], nil
	default:
		return "", &ErrAmbiguous{Paths: matches}
	}
}

type mcpFile struct {
	MCPServers map[string]json.RawMessage `json:"mcpServers"`
}

type tiedYAMLServer struct {
	Env  map[string]string `json:"env"`
	Args []string          `json:"args"`
}

// Analyze reads mcp.json and validates tied-yaml / TIED_BASE_PATH against workspace.
func Analyze(workspace, mcpJSONPath string) (*Result, error) {
	workspace = filepath.Clean(workspace)
	res := &Result{
		MCPJSONPath:   mcpJSONPath,
		RuntimeNotice: RuntimeMCPNotice,
	}
	data, err := os.ReadFile(mcpJSONPath)
	if err != nil {
		res.Status = StatusBlocked
		res.Errors = append(res.Errors, fmt.Sprintf("read mcp.json: %v", err))
		return res, nil
	}
	var root mcpFile
	if err := json.Unmarshal(data, &root); err != nil {
		res.Status = StatusBlocked
		res.Errors = append(res.Errors, fmt.Sprintf("parse mcp.json: %v", err))
		return res, nil
	}
	if root.MCPServers == nil {
		res.Status = StatusBlocked
		res.Errors = append(res.Errors, "mcp.json has no mcpServers object")
		return res, nil
	}
	raw, ok := root.MCPServers["tied-yaml"]
	if !ok || len(raw) == 0 {
		res.Status = StatusBlocked
		res.Errors = append(res.Errors, `mcpServers["tied-yaml"] is missing; run copy_files.sh on this project or add tied-yaml in .cursor/mcp.json`)
		return res, nil
	}
	var srv tiedYAMLServer
	if err := json.Unmarshal(raw, &srv); err != nil {
		res.Status = StatusBlocked
		res.Errors = append(res.Errors, fmt.Sprintf("parse tied-yaml server entry: %v", err))
		return res, nil
	}
	base := strings.TrimSpace(srv.Env["TIED_BASE_PATH"])
	if base == "" {
		res.Status = StatusBlocked
		res.Errors = append(res.Errors, `tied-yaml env.TIED_BASE_PATH is missing or empty`)
		return res, nil
	}
	res.TIEDBasePath = base
	if !filepath.IsAbs(base) {
		res.Status = StatusBlocked
		res.Errors = append(res.Errors, fmt.Sprintf("TIED_BASE_PATH must be absolute (got %q); see TIED docs for .cursor/mcp.json", base))
		return res, nil
	}
	wAbs, err := filepath.EvalSymlinks(workspace)
	if err != nil {
		wAbs = workspace
	}
	tAbs, err := filepath.EvalSymlinks(filepath.Clean(base))
	if err != nil {
		res.Status = StatusBlocked
		res.Errors = append(res.Errors, fmt.Sprintf("TIED_BASE_PATH does not resolve: %v", err))
		return res, nil
	}
	rel, err := filepath.Rel(wAbs, tAbs)
	if err != nil || rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		res.Status = StatusBlocked
		res.Errors = append(res.Errors, fmt.Sprintf("TIED_BASE_PATH (%s) is outside --workspace (%s); MCP writes may target the wrong repo", tAbs, wAbs))
		return res, nil
	}
	req := filepath.Join(tAbs, "requirements.yaml")
	if st, err := os.Stat(req); err != nil || st.IsDir() {
		res.Warnings = append(res.Warnings, "no readable tied/requirements.yaml at TIED_BASE_PATH (greenfield or partial bootstrap)")
		if res.Status == StatusOK {
			res.Status = StatusWarning
		}
	}
	if res.Status == StatusOK && len(res.Warnings) > 0 {
		res.Status = StatusWarning
	}
	return res, nil
}

// Run locates and analyzes MCP config. If override is empty, searches under workspace.
func Run(workspace, mcpJSONOverride string) (*Result, error) {
	path, err := LocateMCPJSON(workspace, mcpJSONOverride)
	if err != nil {
		return nil, err
	}
	return Analyze(workspace, path)
}
